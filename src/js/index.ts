import '../style.scss';
import { render, h } from 'preact';
import { ProgramSearch } from '../components/ProgramSearch.tsx';
import $ from 'jquery';

// ハンバーガーメニュー
$(function () {
    $(".js-toggle-nav").on("click", function () {
        $(this).toggleClass("is-open");
        $(".l-header").toggleClass("is-open");
        $(".l-header__nav").toggleClass("is-open");
        $(".c-nav").toggleClass("is-open");
        $("body").toggleClass("is-open");
    });
    $(".c-nav__item a").on("click", () => {
        $(".js-toggle-nav").removeClass("is-open");
        $(".l-header").removeClass("is-open");
        $(".l-header__nav").removeClass("is-open");
        $(".c-nav").removeClass("is-open");
        $("body").removeClass("is-open");
    });
    $(".scroll-link").on("click", () => {
        $(".js-toggle-nav").removeClass("is-open");
        $(".l-header").removeClass("is-open");
        $(".l-header__nav").removeClass("is-open");
        $(".c-nav").removeClass("is-open");
        $("body").removeClass("is-open");
    });
    // リサイズされたらリセット
    $(window).on("resize", () => {
        $(".js-toggle-nav").removeClass("is-open");
        $(".l-header").removeClass("is-open");
        $(".l-header__nav").removeClass("is-open");
        $(".c-nav").removeClass("is-open");
        $("body").removeClass("is-open");
    });
});

// アコーディオン
document.addEventListener("DOMContentLoaded", function () {
    const detailsElements = document.querySelectorAll("details");

    detailsElements.forEach(details => {
        details.addEventListener("toggle", function () {
            const arrowImg = this.querySelector("img.arrow");
            const arrow2Img = this.querySelector("img.arrow2");
            const isOpen = this.open;

            if (isOpen) {
                if (arrowImg) (arrowImg as HTMLImageElement).src = "/ofpre-recurrent/wp-content/themes/kobe-u/assets/images/top/arrow_after.png";
                if (arrow2Img) (arrow2Img as HTMLImageElement).src = "/ofpre-recurrent/wp-content/themes/kobe-u/assets/images/top/arrow2_after.png";
            } else {
                if (arrowImg) (arrowImg as HTMLImageElement).src = "/ofpre-recurrent/wp-content/themes/kobe-u/assets/images/top/arrow.png";
                if (arrow2Img) (arrow2Img as HTMLImageElement).src = "/ofpre-recurrent/wp-content/themes/kobe-u/assets/images/top/arrow2.png";
            }
        });
    });
});

// スクロール
$(function () {
    var headerHight = 80; //ヘッダーの高さ
    $('a[href^="#"]').click(function () {
        var href = $(this).attr("href");
        if (!href) return false;
        var target = $(href == "#" || href == "" ? "html" : href);
        var offset = target.offset();
        if (!offset) return false;
        var position = offset.top - headerHight;
        $("html, body").animate({
            scrollTop: position
        }, 50, "swing");
        return false;
    });
});

// 吹き出し

// 要素がビューポート内にあるかを確認する関数
function isInViewport(element: Element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// スクロールイベントを処理する関数
function handleScroll() {
    const bubbles = document.querySelectorAll('.speechBubble');

    bubbles.forEach(bubble => {
        if (isInViewport(bubble)) {
            bubble.classList.add('visible');
        } else {
            bubble.classList.remove('visible');
        }
    });
}

// スクロールイベントのリスナーを追加
window.addEventListener('scroll', handleScroll);

// ページ読み込み時に初期チェックを実行
handleScroll();

// ニュースの「過去のお知らせはこちら」ボタンの処理
document.addEventListener('DOMContentLoaded', () => {
    const loadMoreButton = document.getElementById('load-more-news') as HTMLButtonElement;
    
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', async function() {
            const page = parseInt(this.dataset.page || '2');
            const total = parseInt(this.dataset.total || '0');
            
            // ボタンを無効化してローディング表示
            this.disabled = true;
            this.textContent = '読み込み中...';
            
            try {
                // WordPress AJAX設定（グローバル変数）
                const ajaxData = (window as any).loadMoreNewsAjax;
                
                if (!ajaxData) {
                    throw new Error('AJAX設定が見つかりません');
                }
                
                const response = await fetch(ajaxData.ajax_url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: ajaxData.action,
                        nonce: ajaxData.nonce,
                        page: page.toString()
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success && data.news && data.news.length > 0) {
                    // ニュースリストに新しい項目を追加（確認済みの正しいセレクタを使用）
                    const newsContainer = document.querySelector('[class*="news"] ul');
                    
                    if (newsContainer) {
                        data.news.forEach((newsItem: any) => {
                            const listItem = document.createElement('li');
                            listItem.className = 'news-item';
                            listItem.innerHTML = `
                                <a href="${newsItem.url}" target="_blank" rel="noopener noreferrer">
                                    <div class="heading">
                                        <p class="category">NEWS</p>
                                        <p class="date">${newsItem.date}</p>
                                    </div>
                                    <p class="details">${newsItem.title}</p>
                                </a>
                            `;
                            newsContainer.appendChild(listItem);
                        });
                    }
                    
                    // ページ数を更新
                    this.dataset.page = (page + 1).toString();
                    
                    // まだページがある場合はボタンを有効化
                    if (data.has_more) {
                        this.disabled = false;
                        this.textContent = '過去のお知らせはこちら';
                    } else {
                        // すべて表示完了時はボタンを非表示に
                        this.style.display = 'none';
                    }
                } else {
                    throw new Error(data.message || 'データの取得に失敗しました');
                }
                
            } catch (error) {
                console.error('Server error:', error);
                this.textContent = 'エラーが発生しました';
                this.disabled = false; // エラー時は再試行可能
            }
        });
    }
});

// プログラム検索コンポーネントのマウント
document.addEventListener('DOMContentLoaded', () => {
    const programSearchElement = document.getElementById('program-search');
    if (programSearchElement) {
        render(h(ProgramSearch, {}), programSearchElement);
    }
});
