/**
 * File navigation.js.
 *
 * Handles toggling the navigation menu for small screens and enables TAB key
 * navigation support for dropdown menus.
 */
( function() {
	// モバイルナビゲーション用の要素を取得
	const hamburgerButton = document.querySelector( '.c-hamburger' );
	const mobileNav = document.querySelector( '.c-nav' );

	// ハンバーガーボタンまたはナビゲーションが存在しない場合は早期リターン
	if ( ! hamburgerButton || ! mobileNav ) {
		return;
	}

	// ハンバーガーボタンクリック時の処理
	hamburgerButton.addEventListener( 'click', function() {
		// ハンバーガーボタンとナビゲーションの状態をトグル
		hamburgerButton.classList.toggle( 'is-open' );
		// mobileNav.classList.toggle( 'is-open' );
		
		// ナビゲーションの表示/非表示をトグル
		if ( mobileNav.style.visibility === 'visible' ) {
			mobileNav.style.visibility = 'hidden';
			mobileNav.style.opacity = '0';
			hamburgerButton.setAttribute( 'aria-expanded', 'false' );
		} else {
			mobileNav.style.visibility = 'visible';
			mobileNav.style.opacity = '1';
			hamburgerButton.setAttribute( 'aria-expanded', 'true' );
		}
	} );

	// 初期状態でaria-expanded属性を設定
	hamburgerButton.setAttribute( 'aria-expanded', 'false' );

	// ナビゲーション外をクリックした時にメニューを閉じる
	document.addEventListener( 'click', function( event ) {
		const isClickInsideNav = mobileNav.contains( event.target );
		const isClickOnHamburger = hamburgerButton.contains( event.target );

		if ( ! isClickInsideNav && ! isClickOnHamburger && mobileNav.style.visibility === 'visible' ) {
			hamburgerButton.classList.remove( 'is-open' );
			mobileNav.classList.remove( 'is-open' );
			mobileNav.style.visibility = 'hidden';
			mobileNav.style.opacity = '0';
			hamburgerButton.setAttribute( 'aria-expanded', 'false' );
		}
	} );

	// ESCキーでメニューを閉じる
	document.addEventListener( 'keydown', function( event ) {
		if ( event.key === 'Escape' && mobileNav.style.visibility === 'visible' ) {
			hamburgerButton.classList.remove( 'is-open' );
			mobileNav.classList.remove( 'is-open' );
			mobileNav.style.visibility = 'hidden';
			mobileNav.style.opacity = '0';
			hamburgerButton.setAttribute( 'aria-expanded', 'false' );
		}
	} );

	// ナビゲーションリンクのフォーカス処理
	const navLinks = mobileNav.querySelectorAll( 'a' );
	for ( const link of navLinks ) {
		link.addEventListener( 'focus', function() {
			this.parentNode.classList.add( 'focus' );
		} );

		link.addEventListener( 'blur', function() {
			this.parentNode.classList.remove( 'focus' );
		} );
	}
}() );

/**
 * Pagetopボタンの機能
 */
( function() {
	// 即座に実行または読み込み完了後に実行
	function initPagetop() {
		const pagetopButton = document.getElementById( 'pagetop-btn' );
		
		if ( ! pagetopButton ) {
			return;
		}

		// スムーススクロールでページトップに戻る
		function scrollToTop() {
			window.scrollTo( {
				top: 0,
				behavior: 'smooth'
			} );
		}

		// イベントリスナーの設定
		pagetopButton.addEventListener( 'click', scrollToTop );

		// キーボードでのアクセス（Enterキー、Spaceキー）
		pagetopButton.addEventListener( 'keydown', function( event ) {
			if ( event.key === 'Enter' || event.key === ' ' ) {
				event.preventDefault();
				scrollToTop();
			}
		} );
	}

	// DOMが既に読み込み済みかチェック
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initPagetop );
	} else {
		// 既に読み込み済みの場合は即座に実行
		initPagetop();
	}
}() );
