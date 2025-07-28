// 操作対象の要素たち
const taskInput = document.getElementById( 'task-input' );
const addTaskForm = document.getElementById( 'add-task-form' );
const taskList = document.getElementById( 'task-list' );
const taskCount = document.getElementById( 'task-count' );
const filterLabels = document.querySelectorAll( '#filters label' );
const sortSelect = document.getElementById( 'sort' );

// タスクを格納する配列（オブジェクトで管理）
let tasks = [];

// 日時をフォーマットする
function formatDateTime ( dateTime ) {
	const pad = ( n ) => String( n ).padStart( 2, '0' );

	const year = dateTime.getFullYear();
	const month = pad( dateTime.getMonth() + 1 );
	const day = pad( dateTime.getDate() );

	const hour = pad( dateTime.getHours() );
	const minute = pad( dateTime.getMinutes() );
	const second = pad( dateTime.getSeconds() );

	return `${ year }/${ month }/${ day } ${ hour }:${ minute }:${ second }`;
}

// タスク配列をlocalStorageに保存
function saveTasks () {
	// idを連番で振り直す
	tasks.forEach( ( task, index ) => {
		task.id = index + 1;
	} );
	try {
		localStorage.setItem( 'todo/tasks', JSON.stringify( tasks ) );
	} catch ( e ) {
		console.error( e.message );
		if ( confirm( '\u{1f480}\u{1f480} 保存に失敗しました \u{1f480}\u{1f480}\n再実行しますか？' ) ) {
			saveTasks();
		}
	}
}

// タスク配列をもとにul要素を再描画
function renderTasks () {

	// 現在のスクロール量を保持する
	const savedScrollY = window.scrollY;

	let filteredTasks = null;
	// フィルタの値:0,1,2
	switch ( document.querySelector( 'input[name="fil-status"]:checked' ).value ) {
		case '1':
			// 1の時は完了のみ
			filteredTasks = tasks.filter( task => task.done === true );
			break;
		case '2':
			// 2の時は未完了のみ
			filtered =
				filteredTasks = tasks.filter( task => task.done === false );
			break;
		default:
			// それ以外の時は全部
			filteredTasks = [ ...tasks ];
			break;
	}

	// ソートの値で並び替える
	if ( sortSelect.value === 'asc' ) {
		filteredTasks.sort( ( a, b ) => a.id - b.id );
	} else {
		filteredTasks.sort( ( a, b ) => b.id - a.id );
	}

	// 一度表示をクリアする
	taskList.replaceChildren();

	filteredTasks.forEach( ( task ) => {
		const li = document.createElement( 'li' );
		li.title = 'クリックで完了/未完了を切り替え';
		if ( task.done ) {
			li.classList.add( 'completed' );
		}

		// 完了トグル（li全体をクリック）
		li.addEventListener( 'click', () => {
			toggleTaskStatus( task.id );
		} );

		// タスクテキスト
		const spanText = document.createElement( 'span' );
		spanText.textContent = task.text;
		spanText.classList.add( 'text' );

		// タスク編集入力
		const input = document.createElement( 'input' );
		input.type = 'text';
		input.id = `edit${ task.id }`;
		input.value = task.text;
		input.addEventListener( 'click', ( e ) => {
			// 編集時はイベントバブルを止める
			e.stopPropagation();
		} );

		// 更新確定ボタン
		const updateBtn = document.createElement( 'button' );
		updateBtn.title = '変更を保存';
		updateBtn.ariaLabel = '保存';
		updateBtn.classList.add( 'update-btn' );
		const updateIcon = document.createElement( 'i' );
		updateIcon.classList.add( 'material-icons' );
		updateIcon.textContent = 'check_small';
		updateBtn.appendChild( updateIcon );
		updateBtn.addEventListener( 'click', ( e ) => {
			// 編集時はイベントバブルを止める
			e.stopPropagation();
		} );

		const editForm = document.createElement( 'form' );
		editForm.classList.add( 'edit' );
		editForm.append( input, updateBtn );
		editForm.addEventListener( 'submit', ( e ) => {
			e.preventDefault();
			// 編集時はイベントバブルを止める
			e.stopPropagation();
			e.target.closest( 'li' ).querySelector( 'form' ).style.display = 'none';
			e.target.closest( 'li' ).querySelector( 'span' ).style.display = 'flex';
			updateTask( task.id, e.target.querySelector( 'input' ).value );
		} );

		// 更新日時
		const time = document.createElement( 'time' );
		time.dateTime = task.update.toISOString();;
		time.textContent = `${ formatDateTime( task.update ) }`;

		// 編集ボタン
		const editBtn = document.createElement( 'button' );
		editBtn.title = 'クリックで編集';
		editBtn.ariaLabel = '編集';
		editBtn.classList.add( 'edit-btn' );
		const editIcon = document.createElement( 'i' );
		editIcon.classList.add( 'material-icons' );
		editIcon.textContent = 'edit';
		editBtn.appendChild( editIcon );
		if ( task.done ) {
			editBtn.disabled = true;
		}
		editBtn.addEventListener( 'click', ( e ) => {
			// 編集時はイベントバブルを止める
			e.stopPropagation();
			e.target.closest( 'li' ).querySelector( 'span' ).style.display = 'none';
			e.target.closest( 'li' ).querySelector( 'form' ).style.display = 'flex';
			e.target.closest( 'li' ).querySelector( 'form>input' ).select();
			e.target.closest( 'li' ).querySelector( 'form>input' ).focus();
		} );

		// 削除ボタン
		const deleteBtn = document.createElement( 'button' );
		deleteBtn.title = 'クリックで削除';
		deleteBtn.ariaLabel = '削除';
		deleteBtn.classList.add( 'delete-btn' );
		const deleteIcon = document.createElement( 'i' );
		deleteIcon.classList.add( 'material-icons' );
		deleteIcon.textContent = 'delete_forever';
		deleteBtn.appendChild( deleteIcon );

		deleteBtn.addEventListener( 'click', ( e ) => {
			// 削除時はイベントバブルを止める
			e.stopPropagation();
			removeTask( task.id );
		} );

		// 左カラム（テキスト類）
		const taskBody = document.createElement('div');
		taskBody.classList.add('task-body');
		taskBody.append(spanText, editForm, time);

		// 右カラム（ボタン類）
		const taskActions = document.createElement('div');
		taskActions.classList.add('task-actions');
		taskActions.append(editBtn, editBtn, deleteBtn);

		// liにカラムを追加
		li.append( taskBody,  taskActions);
		taskList.appendChild( li );
	} );
	updateTaskCount();
	window.scrollTo( 0, savedScrollY );
}

// タスクを追加する処理
function handleAddTask () {
	const taskText = taskInput.value.trim();
	if ( taskText === '' ) {
		alert( 'タスクを入力してください。' );
		return;
	}

	// idを生成
	const newId = tasks.length > 0 ? Math.max( ...tasks.map( task => task.id ) ) + 1 : 1;

	// タスクオブジェクトを作成して配列に追加
	const newTask = {
		id: newId,
		text: taskText,
		done: false,
		update: new Date()
	};
	tasks.push( newTask );

	taskInput.value = '';
	renderTasks();
	saveTasks();
}

// タスクを更新
function updateTask ( id, text ) {
	const target = tasks.find( task => task.id === id )
	target.text = text;
	target.update = new Date();
	renderTasks();
	saveTasks();
}

// タスクを削除
function removeTask ( id ) {
	if ( !confirm( '本当に削除しますか？' ) ) {
		return;
	}
	const index = tasks.findIndex( task => task.id === id );
	console.log( `id:${ id }を削除しました` );
	tasks.splice( index, 1 ); // 配列から削除
	renderTasks();
	saveTasks();
}

// 完了状態の切り替え
function toggleTaskStatus ( id ) {
	const target = tasks.find( task => task.id === id )
	target.done = !target.done;
	target.update = new Date();
	renderTasks();
	saveTasks();
}

// タスク数の表示を更新
function updateTaskCount () {
	const total = tasks.length;
	const completed = tasks.filter( task => task.done ).length;
	taskCount.textContent = `完了: ${ completed } / 総数: ${ total }`;
}

// タスク追加フォームのイベント登録
addTaskForm.addEventListener( 'submit', ( e ) => {
	e.preventDefault();
	handleAddTask();
} );

// フィルターラジオのイベント登録
filterLabels.forEach( ( filterLabel ) => {
	filterLabel.addEventListener( 'change', ( e ) => {
		filterLabels.forEach( ( label ) => {
			label.classList.remove( 'checked' );
			if ( label.firstChild.checked ) {
				label.classList.add( 'checked' );
			};
		} );
		try {
			localStorage.setItem( 'todo/settings/filter', document.querySelector( 'input[name="fil-status"]:checked' ).value );
		} finally {
			renderTasks();
		}
	} );
} );

// ソートのイベント登録
sortSelect.addEventListener( 'change', ( e ) => {
	try {
		localStorage.setItem( 'todo/settings/sort', sortSelect.value );
	} finally {
		renderTasks();
	}
} );

// 初期化処理
document.addEventListener( 'DOMContentLoaded', () => {
	try {
		// タスクデータをロード
		if ( localStorage.getItem( 'todo/tasks' ) ) {
			tasks = JSON.parse( localStorage.getItem( 'todo/tasks' ) );
			tasks.forEach( ( task ) => {
				task.update = new Date( task.update );
			} );
		}
		// フィルタ設定値をロード
		const filterValue = localStorage.getItem( 'todo/settings/filter' );
		if ( filterValue ) {
			filterLabels.forEach( ( label ) => {
				label.classList.remove( 'checked' );
				if ( label.querySelector( 'input' ).value === filterValue ) {
					label.querySelector( 'input' ).checked = true;
					label.classList.add( 'checked' );
				}
			} );
		}
		// ソート設定値をロード
		const sortValue = localStorage.getItem( 'todo/settings/sort' );
		if ( sortValue ) {
			for ( option of sortSelect.children ) {
				if ( sortValue === option.value ) {
					option.selected = true;
					break;
				}
			}
		}
	} finally {
		renderTasks();
		taskInput.focus();
	}
} );

// サンプルデータを反映する
document.getElementById( 'sample-data-btn' ).addEventListener( 'click', ( e ) => {
	e.preventDefault();
	const sampleData = "[\n  { \"id\": 1, \"text\": \"console.log() を使ってメッセージを出力する\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 2, \"text\": \"let / const の違いを理解して使い分ける\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 3, \"text\": \"if文で「偶数・奇数」を判定する関数を作成\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 4, \"text\": \"配列から合計を計算する関数を作る\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 5, \"text\": \"HTMLボタンをクリックしたときにテキストを変更する\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 6, \"text\": \"addEventListener を使ってイベント処理を追加\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 7, \"text\": \"簡単なToDoリストを作成する（追加のみ）\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 8, \"text\": \"ランダムな背景色に変更するボタンを作る\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 9, \"text\": \"forEach を使って配列内の項目を表示\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 10, \"text\": \"オブジェクトを使ってプロフィール情報を出力\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 11, \"text\": \"querySelectorAll を使って複数要素を取得\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 12, \"text\": \"入力フォームから値を取得し表示する\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 13, \"text\": \"localStorage にデータを保存／読み込みする\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 14, \"text\": \"setInterval で1秒ごとにカウントアップ\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 15, \"text\": \"fetch() で外部APIからJSONを取得\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 16, \"text\": \".then().catch() でエラーハンドリングを追加\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 17, \"text\": \"async/await を使って非同期処理をシンプルに書く\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 18, \"text\": \"選択されたラジオボタンに応じて表示内容を変える\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 19, \"text\": \"チェック済みのタスクにスタイルを適用する\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" },\n  { \"id\": 20, \"text\": \"try...catch...finally を使って安全なコードを書く\", \"done\": false, \"update\": \"2025-07-15T09:00:00Z\" }\n]";
	tasks = JSON.parse( sampleData );
	tasks.forEach( ( task ) => {
		task.update = new Date( task.update );
	} );
	renderTasks();
	saveTasks();
} );