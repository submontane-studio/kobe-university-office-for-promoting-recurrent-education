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

// プログラム検索コンポーネントのマウント
document.addEventListener('DOMContentLoaded', () => {
    const programSearchElement = document.getElementById('program-search');
    if (programSearchElement) {
        render(h(ProgramSearch, {}), programSearchElement);
    }
});
