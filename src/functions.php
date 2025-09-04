<?php
// 0. 何があっても先頭で注入を予約
add_action('wp_head', function () {
  $is_dev = defined('IS_DEV') && IS_DEV === '1';
  if (!$is_dev) return;

  $origin = defined('HMR_ORIGIN') ? HMR_ORIGIN : 'http://localhost:3000';
  echo "<!-- Vite HMR ON -->\n";
  echo "<script type='module' src='{$origin}/@vite/client'></script>\n";
  echo "<script type='module' src='{$origin}/src/js/index.ts'></script>\n";
}, 0);

add_action('wp_enqueue_scripts', function () {
  $is_dev = defined('IS_DEV') && IS_DEV === '0';

  if ($is_dev) {

    add_action('wp_print_styles', function () {
      global $wp_styles;
      if (!$wp_styles) return;
      foreach ((array) $wp_styles->queue as $h) {
        $src = $wp_styles->registered[$h]->src ?? '';
        if ($src && strpos($src, '/wp-includes/') === false) {
          wp_dequeue_style($h); wp_deregister_style($h);
        }
      }
    }, 999);

    add_action('wp_print_scripts', function () {
      global $wp_scripts;
      if (!$wp_scripts) return;
      foreach ((array) $wp_scripts->queue as $h) {
        $src = $wp_scripts->registered[$h]->src ?? '';
        if ($src && strpos($src, '/wp-includes/') === false) {
          wp_dequeue_script($h); wp_deregister_script($h);
        }
      }
    }, 999);

    return;
  }


  $style = get_stylesheet_directory() . '/style.css';
  if (file_exists($style)) {
    wp_enqueue_style('theme-style', get_stylesheet_uri(), [], filemtime($style));
  }
  $css = get_template_directory() . '/style.css';
  if (file_exists($css)) {
    wp_enqueue_style('theme-app', get_template_directory_uri().'/style.css', ['theme-style'], filemtime($css));
  }
  $js = get_template_directory() . '/js/index.js';
  if (file_exists($js)) {
    wp_enqueue_script('theme-app', get_template_directory_uri().'/js/index.js', [], filemtime($js), true);
  }
}, 99);

/**
 * 神戸大学リカレント教育プログラム functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package 神戸大学リカレント教育プログラム
 */

if ( ! defined( '_S_VERSION' ) ) {
	// Replace the version number of the theme on each release.
	define( '_S_VERSION', '1.0.0' );
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function kobe_u_setup() {
	/*
		* Make theme available for translation.
		* Translations can be filed in the /languages/ directory.
		* If you're building a theme based on 神戸大学リカレント教育プログラム, use a find and replace
		* to change 'kobe-u' to the name of your theme in all the template files.
		*/
	load_theme_textdomain( 'kobe-u', get_template_directory() . '/languages' );

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	/*
		* Let WordPress manage the document title.
		* By adding theme support, we declare that this theme does not use a
		* hard-coded <title> tag in the document head, and expect WordPress to
		* provide it for us.
		*/
	add_theme_support( 'title-tag' );

	/*
		* Enable support for Post Thumbnails on posts and pages.
		*
		* @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		*/
	add_theme_support( 'post-thumbnails' );

	// This theme uses wp_nav_menu() in one location.
	register_nav_menus(
		array(
			'menu-1' => esc_html__( 'Primary', 'kobe-u' ),
		)
	);

	/*
		* Switch default core markup for search form, comment form, and comments
		* to output valid HTML5.
		*/
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);

	// Set up the WordPress core custom background feature.
	add_theme_support(
		'custom-background',
		apply_filters(
			'kobe_u_custom_background_args',
			array(
				'default-color' => 'ffffff',
				'default-image' => '',
			)
		)
	);

	// Add theme support for selective refresh for widgets.
	add_theme_support( 'customize-selective-refresh-widgets' );

	/**
	 * Add support for core custom logo.
	 *
	 * @link https://codex.wordpress.org/Theme_Logo
	 */
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 250,
			'width'       => 250,
			'flex-width'  => true,
			'flex-height' => true,
		)
	);
}
add_action( 'after_setup_theme', 'kobe_u_setup' );

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *
 * @global int $content_width
 */
function kobe_u_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'kobe_u_content_width', 640 );
}
add_action( 'after_setup_theme', 'kobe_u_content_width', 0 );

/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */
function kobe_u_widgets_init() {
	register_sidebar(
		array(
			'name'          => esc_html__( 'Sidebar', 'kobe-u' ),
			'id'            => 'sidebar-1',
			'description'   => esc_html__( 'Add widgets here.', 'kobe-u' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'kobe_u_widgets_init' );

/**
 * Enqueue scripts and styles.
 */
function kobe_u_scripts() {
	wp_enqueue_style( 'kobe-u-style', get_stylesheet_uri(), array(), _S_VERSION );
	wp_style_add_data( 'kobe-u-style', 'rtl', 'replace' );

	wp_enqueue_script( 'kobe-u-navigation', get_template_directory_uri() . '/js/navigation.js', array(), _S_VERSION, true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'kobe_u_scripts' );

/**
 * Implement the Custom Header feature.
 */
require get_template_directory() . '/inc/custom-header.php';

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/inc/template-tags.php';

/**
 * Functions which enhance the theme by hooking into WordPress.
 */
require get_template_directory() . '/inc/template-functions.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/inc/customizer.php';

/**
 * Load Jetpack compatibility file.
 */
if ( defined( 'JETPACK__VERSION' ) ) {
	require get_template_directory() . '/inc/jetpack.php';
}

add_action( 'init' , 'my_remove_post_support' );
function my_remove_post_support() {
	remove_post_type_support('post','editor');
}

add_shortcode('add_part', function($attr){
	ob_start();
	get_template_part($attr['temp']);
	return ob_get_clean();
});
