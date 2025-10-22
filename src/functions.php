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
  $is_dev = defined('IS_DEV') && IS_DEV === '1';

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

/**
 * programsカスタム投稿タイプを登録
 */
function register_programs_post_type() {
	$labels = array(
		'name'               => 'プログラム',
		'singular_name'      => 'プログラム',
		'menu_name'          => 'プログラム',
		'add_new'            => '新規追加',
		'add_new_item'       => '新しいプログラムを追加',
		'edit_item'          => 'プログラムを編集',
		'new_item'           => '新しいプログラム',
		'view_item'          => 'プログラムを表示',
		'search_items'       => 'プログラムを検索',
		'not_found'          => 'プログラムが見つかりません',
		'not_found_in_trash' => 'ゴミ箱にプログラムはありません',
	);

	$args = array(
		'labels'              => $labels,
		'public'              => true,
		'publicly_queryable'  => true,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'show_in_rest'        => true, // REST API対応
		'rest_base'           => 'programs',
		'query_var'           => true,
		'rewrite'             => array( 'slug' => 'programs' ),
		'capability_type'     => 'post',
		'has_archive'         => true,
		'hierarchical'        => false,
		'menu_position'       => 5,
		'menu_icon'           => 'dashicons-welcome-learn-more',
		'supports'            => array( 'title', 'thumbnail', 'excerpt', 'custom-fields' ),
	);

	register_post_type( 'programs', $args );
}
add_action( 'init', 'register_programs_post_type' );

/**
 * ACF Local JSON保存場所を指定
 */
function my_acf_json_save_point( $path ) {
	return get_stylesheet_directory() . '/acf-json';
}
add_filter( 'acf/settings/save_json', 'my_acf_json_save_point' );

/**
 * ACF Local JSON読み込み場所を指定
 */
function my_acf_json_load_point( $paths ) {
	unset( $paths[0] );
	$paths[] = get_stylesheet_directory() . '/acf-json';
	return $paths;
}

/**
 * REST APIでプログラムのカスタムフィールドを公開
 */
function add_programs_custom_fields_to_api() {
	// 学位取得フィールドをREST APIに追加
	register_rest_field(
		'programs',
		'degree_type',
		array(
			'get_callback' => function( $post ) {
				return get_field( 'degree_type', $post['id'] );
			},
			'update_callback' => function( $value, $post ) {
				return update_field( 'degree_type', $value, $post->ID );
			},
			'schema' => array(
				'description' => '学位取得タイプ',
				'type'        => 'string',
				'enum'        => array( 'with', 'without' ),
			),
		)
	);

	// プログラム層フィールドをREST APIに追加
	register_rest_field(
		'programs',
		'program_layer',
		array(
			'get_callback' => function( $post ) {
				return get_field( 'program_layer', $post['id'] );
			},
			'update_callback' => function( $value, $post ) {
				return update_field( 'program_layer', $value, $post->ID );
			},
			'schema' => array(
				'description' => 'プログラム層',
				'type'        => 'string',
				'enum'        => array( 'foundation', 'core', 'collaboration', 'other' ),
			),
		)
	);

	// 分野タグフィールドをREST APIに追加
	register_rest_field(
		'programs',
		'field_tags',
		array(
			'get_callback' => function( $post ) {
				$tags = get_field( 'field_tags', $post['id'] );
				return is_array( $tags ) ? $tags : array();
			},
			'update_callback' => function( $value, $post ) {
				return update_field( 'field_tags', $value, $post->ID );
			},
			'schema' => array(
				'description' => '分野タグ',
				'type'        => 'array',
				'items'       => array( 'type' => 'string' ),
			),
		)
	);

	// プログラム概要フィールドをREST APIに追加
	register_rest_field(
		'programs',
		'program_description',
		array(
			'get_callback' => function( $post ) {
				return get_field( 'program_description', $post['id'] );
			},
			'update_callback' => function( $value, $post ) {
				return update_field( 'program_description', $value, $post->ID );
			},
			'schema' => array(
				'description' => 'プログラム概要',
				'type'        => 'string',
			),
		)
	);

	// プログラムURLフィールドをREST APIに追加
	register_rest_field(
		'programs',
		'program_url',
		array(
			'get_callback' => function( $post ) {
				return get_field( 'program_url', $post['id'] );
			},
			'update_callback' => function( $value, $post ) {
				return update_field( 'program_url', $value, $post->ID );
			},
			'schema' => array(
				'description' => 'プログラムURL',
				'type'        => 'string',
				'format'      => 'uri',
			),
		)
	);

	// プログラムタイプフィールドをREST APIに追加
	register_rest_field(
		'programs',
		'program_type',
		array(
			'get_callback' => function( $post ) {
				return get_field( 'program_type', $post['id'] );
			},
			'update_callback' => function( $value, $post ) {
				return update_field( 'program_type', $value, $post->ID );
			},
			'schema' => array(
				'description' => 'プログラムタイプ',
				'type'        => 'string',
				'enum'        => array( 'interdisciplinary', 'other_recurrent', 'professional', 'special' ),
			),
		)
	);

	// 動画URLフィールドをREST APIに追加
	register_rest_field(
		'programs',
		'video_url',
		array(
			'get_callback' => function( $post ) {
				return get_field( 'video_url', $post['id'] );
			},
			'update_callback' => function( $value, $post ) {
				return update_field( 'video_url', $value, $post->ID );
			},
			'schema' => array(
				'description' => '動画URL',
				'type'        => 'string',
				'format'      => 'uri',
			),
		)
	);

	// 応募開始日フィールドをREST APIに追加
	register_rest_field(
		'programs',
		'application_start_date',
		array(
			'get_callback' => function( $post ) {
				return get_field( 'application_start_date', $post['id'] );
			},
			'update_callback' => function( $value, $post ) {
				return update_field( 'application_start_date', $value, $post->ID );
			},
			'schema' => array(
				'description' => '応募開始日',
				'type'        => 'string',
				'format'      => 'date',
			),
		)
	);

	// 応募終了日フィールドをREST APIに追加
	register_rest_field(
		'programs',
		'application_end_date',
		array(
			'get_callback' => function( $post ) {
				return get_field( 'application_end_date', $post['id'] );
			},
			'update_callback' => function( $value, $post ) {
				return update_field( 'application_end_date', $value, $post->ID );
			},
			'schema' => array(
				'description' => '応募終了日',
				'type'        => 'string',
				'format'      => 'date',
			),
		)
	);
}
add_action( 'rest_api_init', 'add_programs_custom_fields_to_api' );
add_filter( 'acf/settings/load_json', 'my_acf_json_load_point' );

/**
 * ラベルマッピング用のREST APIエンドポイントを追加
 */
function register_label_mappings_api() {
	register_rest_route('wp/v2', '/label-mappings', array(
		'methods' => 'GET',
		'callback' => 'get_label_mappings',
		'permission_callback' => '__return_true',
	));
}

function get_label_mappings() {
	$field_label_map = [
		'health' => '健康科学',
		'science' => '理学',
		'mathematics' => '数学',
		'engineering' => '工学',
		'medicine' => '医学',
		'economics' => '経済学',
		'law' => '法学',
		'literature' => '文学',
		'education' => '教育学',
		'agriculture' => '農学'
	];

	$program_type_label_map = [
		'interdisciplinary' => '異分野共創・価値創造・リカレント教育プログラム',
		'other_recurrent' => 'その他のリカレント・リスキリング特別プログラム',
		'professional' => '専門職大学院',
		'special' => '社会人向け特別プログラム'
	];

	return array(
		'field_labels' => $field_label_map,
		'program_type_labels' => $program_type_label_map
	);
}

add_action('rest_api_init', 'register_label_mappings_api');

/**
 * プログラム検索用ショートコード（メインループ版）
 */
function program_search_shortcode() {
	try {
		ob_start();
		
		// エラーハンドリングのテスト
		if (!function_exists('get_post_types')) {
			throw new Exception('WordPress関数が利用できません');
		}
	
	// プログラムデータをクエリ
	$programs_query = new WP_Query([
		'post_type' => 'programs',
		'posts_per_page' => -1,
		'post_status' => 'publish',
		'orderby' => 'date',
		'order' => 'DESC'
	]);
	

	
	$programs_data = [];
	$field_labels = [];
	
	if ($programs_query->have_posts()) {
		while ($programs_query->have_posts()) {
			$programs_query->the_post();
			$post_id = get_the_ID();
			
			// ACFフィールドから分野データを取得
			$field_tags = get_field('field_tags', $post_id);
			$field_objects = [];
			
			// 分野ラベルのマッピング
			$field_label_map = [
				'health' => '健康科学',
				'science' => '理学',
				'mathematics' => '数学',
				'engineering' => '工学',
				'medicine' => '医学',
				'economics' => '経済学',
				'law' => '法学',
				'literature' => '文学',
				'education' => '教育学',
				'agriculture' => '農学'
			];
			
			if (is_array($field_tags)) {
				foreach ($field_tags as $field_value) {
					if (is_array($field_value) && isset($field_value['value']) && isset($field_value['label'])) {
						// 新形式（両方配列）
						$field_objects[] = $field_value;
						$field_labels[$field_value['value']] = $field_value['label'];
					} else {
						// 旧形式対応（値のみ）
						$label = isset($field_label_map[$field_value]) ? $field_label_map[$field_value] : $field_value;
						$field_objects[] = ['value' => $field_value, 'label' => $label];
						$field_labels[$field_value] = $label;
					}
				}
			}
			
			$program_data = [
				'id' => $post_id,
				'title' => ['rendered' => get_the_title()],
				'excerpt' => ['rendered' => get_the_excerpt()],
				'program_description' => get_field('program_description', $post_id),
				'program_url' => get_field('program_url', $post_id),
				'video_url' => get_field('video_url', $post_id),
				'application_start_date' => get_field('application_start_date', $post_id),
				'application_end_date' => get_field('application_end_date', $post_id),
				'degree_type' => get_field('degree_type', $post_id),
				'program_type' => get_field('program_type', $post_id),
				'program_layer' => get_field('program_layer', $post_id),
				'field_tags' => array_column($field_objects, 'value'),
				'field_labels' => array_column($field_objects, 'label'),
			];
			
			// アイキャッチ画像（ダミー画像対応）
			$dummy_image_url = get_template_directory_uri() . '/assets/images/noimage.png';
			
			// デフォルトはダミー画像
			$program_data['_embedded'] = [
				'wp:featuredmedia' => [[
					'source_url' => $dummy_image_url,
					'alt_text' => 'プログラム画像'
				]]
			];
			
			// アイキャッチがある場合は実際の画像を使用
			if (has_post_thumbnail()) {
				$thumbnail_id = get_post_thumbnail_id();
				$program_data['_embedded'] = [
					'wp:featuredmedia' => [[
						'source_url' => get_the_post_thumbnail_url($post_id, 'full'),
						'alt_text' => get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true) ?: 'プログラム画像'
					]]
				];
			}
			
			$programs_data[] = $program_data;
		}
		wp_reset_postdata();
	}
	
	// JavaScriptで使用するデータを出力
	?>
	<script type="text/javascript">
		window.programsData = <?php echo json_encode($programs_data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;
		window.fieldLabelsMap = <?php echo json_encode($field_labels, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;
	</script>
	
	<!-- 検索UI -->
	<div id="program-search"></div>
	
	<!-- 初期プログラム表示 -->
	<div id="programs-initial-display">
		<div class="c-program-search">
			<!-- 検索結果ヘッダー -->
			<div class="c-program-search__result-header">
				<h3 class="c-program-search__result-title">検索結果</h3>
				<span class="c-program-search__result-count"><?php echo count($programs_data); ?>件</span>
			</div>
			
			<div class="c-program-search__results">
				<?php
				// 学位取得別にグループ化
				$with_degree = array_filter($programs_data, function($p) { return $p['degree_type'] === 'with'; });
				$without_degree = array_filter($programs_data, function($p) { return $p['degree_type'] === 'without'; });
				
				if (!empty($with_degree)): ?>
					<div class="c-program-group">
						<h4 class="c-program-group__title">学位取得を伴うもの</h4>
						<div class="c-program-group__items">
							<?php foreach ($with_degree as $program): ?>
								<?php ?>
								<?php echo render_program_card($program, $field_labels); ?>
							<?php endforeach; ?>
						</div>
					</div>
				<?php endif;
				
				if (!empty($without_degree)): ?>
					<div class="c-program-group">
						<h4 class="c-program-group__title">学位取得を伴わないもの</h4>
						<div class="c-program-group__items">
							<?php foreach ($without_degree as $program): ?>
								<?php ?>
								<?php echo render_program_card($program, $field_labels); ?>
							<?php endforeach; ?>
						</div>
					</div>
				<?php endif; ?>
			</div>
		</div>
	</div>
	
	<?php		$output = ob_get_clean();
		return $output;
		
	} catch (Exception $e) {
		ob_end_clean(); // バッファをクリア
		return '<div class="error">エラーが発生しました</div>';
	}
}

/**
 * プログラムカードをレンダリング
 */
function render_program_card($program, $field_labels) {
	ob_start();
	?>
	<article class="c-program-card">
		<?php
		// 画像情報を取得
		$image_url = $program['_embedded']['wp:featuredmedia'][0]['source_url'] ?? '';
		$image_alt = $program['_embedded']['wp:featuredmedia'][0]['alt_text'] ?? 'プログラム画像';
		
		// ダミー画像のフォールバック
		if (empty($image_url)) {
			$image_url = get_template_directory_uri() . '/assets/images/noimage.png';
		}
		?>
		
		<div class="c-program-card__image">
			<img src="<?php echo esc_url($image_url); ?>" alt="<?php echo esc_attr($image_alt); ?>" loading="lazy" />
		</div>
		

		
		<div class="c-program-card__content">
			<h3 class="c-program-card__title">
				<?php echo esc_html($program['title']['rendered']); ?>
			</h3>
			
			<?php if (!empty($program['program_description'])): ?>
				<div class="c-program-card__description">
					<?php echo wp_kses_post($program['program_description']); ?>
				</div>
			<?php endif; ?>
			
			<div class="c-program-card__meta">
				<?php if (!empty($program['degree_type'])): ?>
					<span class="c-badge c-badge--<?php echo esc_attr($program['degree_type']); ?>">
						<?php echo $program['degree_type'] === 'with' ? '学位取得あり' : '学位取得なし'; ?>
					</span>
				<?php endif; ?>
				
				<?php if (!empty($program['program_layer'])): ?>
					<span class="c-badge c-badge--<?php echo esc_attr($program['program_layer']); ?>">
						<?php
						$layer_labels = [
							'foundation' => '基盤',
							'core' => 'コア',
							'collaboration' => '連携'
						];
						echo esc_html($layer_labels[$program['program_layer']] ?? 'その他');
						?>
					</span>
				<?php endif; ?>
			</div>
			
			<?php if (!empty($program['field_tags'])): ?>
				<div class="c-program-card__tags">
					<?php foreach ($program['field_tags'] as $index => $tag): ?>
						<span class="c-tag">
							<?php 
							$label = $program['field_labels'][$index] ?? $field_labels[$tag] ?? $tag;
							echo esc_html($label);
							?>
						</span>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
			
			<?php if (!empty($program['program_url'])): ?>
				<a href="<?php echo esc_url($program['program_url']); ?>" 
				   class="c-program-card__link" 
				   target="_blank" 
				   rel="noopener noreferrer">
					詳細を見る
				</a>
			<?php endif; ?>
		</div>
	</article>
	<?php
	return ob_get_clean();
}
add_shortcode( 'program_search', 'program_search_shortcode' );


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

/**
 * 管理画面用JavaScript（プログラムタイプ連動制御）の読み込み
 */
function enqueue_admin_scripts($hook) {
    // プログラム投稿タイプの編集画面のみで読み込み
    if ($hook !== 'post.php' && $hook !== 'post-new.php') {
        return;
    }
    
    global $post;
    if (!$post || $post->post_type !== 'programs') {
        return;
    }
    
    // 管理画面用JavaScript を読み込み
    wp_enqueue_script(
        'programs-admin-script',
        get_template_directory_uri() . '/js/admin.js',
        array(),
        filemtime(get_template_directory() . '/js/admin.js'),
        true
    );
}
add_action('admin_enqueue_scripts', 'enqueue_admin_scripts');

/**
 * プログラムタイプの値検証（保存時）
 */
function validate_program_type_on_save($post_id) {
    // 自動保存・リビジョン・権限チェック
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (wp_is_post_revision($post_id)) return;
    if (!current_user_can('edit_post', $post_id)) return;
    
    // プログラム投稿タイプのみ対象
    if (get_post_type($post_id) !== 'programs') return;
    
    // ACFフィールドの値を取得
    $degree_type = $_POST['acf']['field_degree_type'] ?? '';
    $program_type = $_POST['acf']['field_program_type'] ?? '';
    
    // バリデーションルール
    $allowed_combinations = [
        'with' => ['professional', 'special'],
        'without' => ['interdisciplinary', 'other_recurrent']
    ];
    
    // 不正な組み合わせをチェック
    if ($degree_type && $program_type) {
        $allowed_program_types = $allowed_combinations[$degree_type] ?? [];
        
        if (!in_array($program_type, $allowed_program_types)) {
            // エラーメッセージをセット
            add_action('admin_notices', function() use ($degree_type, $program_type) {
                echo '<div class="notice notice-error"><p>';
                echo '学位取得「' . $degree_type . '」とプログラムタイプ「' . $program_type . '」の組み合わせは無効です。';
                echo '</p></div>';
            });
            
            // 不正な値の場合は保存を中断（オプション）
            // remove_action('save_post', 'validate_program_type_on_save');
        }
    }
}
add_action('save_post', 'validate_program_type_on_save');

/**
 * 応募開始日のYYYY/MM/DD形式バリデーション
 */
function validate_application_start_date($valid, $value, $field, $input_name) {
	// 空の場合はスキップ
	if (empty($value)) {
		return $valid;
	}

	// YYYY/MM/DD形式の正規表現チェック
	if (!preg_match('/^\d{4}\/\d{2}\/\d{2}$/', $value)) {
		$valid = '応募開始日は「YYYY/MM/DD」形式で入力してください（例: 2025/01/15）';
		return $valid;
	}

	// 日付の妥当性チェック
	$date_parts = explode('/', $value);
	if (!checkdate((int)$date_parts[1], (int)$date_parts[2], (int)$date_parts[0])) {
		$valid = '応募開始日に正しい日付を入力してください';
		return $valid;
	}

	return $valid;
}
add_filter('acf/validate_value/name=application_start_date', 'validate_application_start_date', 10, 4);

/**
 * 応募終了日のYYYY/MM/DD形式バリデーション
 */
function validate_application_end_date($valid, $value, $field, $input_name) {
	// 空の場合はスキップ
	if (empty($value)) {
		return $valid;
	}

	// YYYY/MM/DD形式の正規表現チェック
	if (!preg_match('/^\d{4}\/\d{2}\/\d{2}$/', $value)) {
		$valid = '応募終了日は「YYYY/MM/DD」形式で入力してください（例: 2025/03/31）';
		return $valid;
	}

	// 日付の妥当性チェック
	$date_parts = explode('/', $value);
	if (!checkdate((int)$date_parts[1], (int)$date_parts[2], (int)$date_parts[0])) {
		$valid = '応募終了日に正しい日付を入力してください';
		return $valid;
	}

	return $valid;
}
add_filter('acf/validate_value/name=application_end_date', 'validate_application_end_date', 10, 4);

/**
 * フロントページ動画URLのVimeo URLバリデーション
 */
function validate_frontpage_video_url($valid, $value, $field, $input_name) {
	// 空の場合はスキップ
	if (empty($value)) {
		return $valid;
	}

	// Vimeo URLのパターンチェック
	// 許可するパターン:
	// - https://vimeo.com/123456789
	// - https://player.vimeo.com/video/123456789
	// - https://vimeo.com/channels/staffpicks/123456789
	// - https://vimeo.com/groups/shortfilms/videos/123456789
	$vimeo_pattern = '/^https?:\/\/(www\.)?(vimeo\.com|player\.vimeo\.com)\/.+/i';

	if (!preg_match($vimeo_pattern, $value)) {
		$valid = '動画URLはVimeoのURLを入力してください（例: https://vimeo.com/123456789）';
		return $valid;
	}

	return $valid;
}
add_filter('acf/validate_value/name=frontpage_video_url', 'validate_frontpage_video_url', 10, 4);

/**
 * フロントページ動画埋め込みショートコード
 * 使用方法: [frontpage_video]
 */
function frontpage_video_shortcode() {
	// フロントページのIDを取得（通常は get_option('page_on_front') で取得）
	$front_page_id = get_option('page_on_front');

	// frontpage_video_url フィールドから動画URLを取得
	$video_url = get_field('frontpage_video_url', $front_page_id);

	// URLが空の場合は何も表示しない
	if (empty($video_url)) {
		return '';
	}

	// Vimeo動画IDを抽出
	// 対応パターン:
	// - https://vimeo.com/123456789
	// - https://player.vimeo.com/video/123456789
	// - https://vimeo.com/channels/staffpicks/123456789
	$vimeo_id = '';
	if (preg_match('/vimeo\.com\/(?:video\/|channels\/[^\/]+\/)?(\d+)/i', $video_url, $matches)) {
		$vimeo_id = $matches[1];
	} elseif (preg_match('/player\.vimeo\.com\/video\/(\d+)/i', $video_url, $matches)) {
		$vimeo_id = $matches[1];
	}

	// IDが取得できなかった場合
	if (empty($vimeo_id)) {
		return '';
	}

	// Vimeo埋め込みiframeを生成（レスポンシブ対応）
	$iframe_html = sprintf(
		'<div class="p-home__video__embed" style="position: relative; padding-bottom: 56.25%%; height: 0; overflow: hidden;">
			<iframe src="https://player.vimeo.com/video/%s?title=0&byline=0&portrait=0"
				style="position: absolute; top: 0; left: 0; width: 100%%; height: 100%%;"
				frameborder="0"
				allow="autoplay; fullscreen; picture-in-picture"
				allowfullscreen
				loading="lazy">
			</iframe>
		</div>',
		esc_attr($vimeo_id)
	);

	return $iframe_html;
}
add_shortcode('frontpage_video', 'frontpage_video_shortcode');

/**
 * ニュースの追加読み込み用AJAX処理
 */
function load_more_news() {
    // 一時的にnonce検証を無効化してテスト（本番では有効にする）
    // if (!wp_verify_nonce($_REQUEST['nonce'] ?? '', 'load_more_news_nonce')) {
    //     wp_die('不正なリクエストです', '', array('response' => 403));
    // }
    
    $page = intval($_REQUEST['page'] ?? 1);
    $posts_per_page = 10; // 1回につき10件読み込み
    
    // ニュース（通常の投稿）を取得
    $news_query = new WP_Query(array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => $posts_per_page,
        'paged' => $page,
        'orderby' => 'date',
        'order' => 'DESC'
    ));
    
    $news_items = array();
    
    if ($news_query->have_posts()) {
        while ($news_query->have_posts()) {
            $news_query->the_post();
            
            $news_items[] = array(
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'url' => get_permalink(),
                'date' => get_the_date('Y.m.d'),
                'excerpt' => get_the_excerpt()
            );
        }
        wp_reset_postdata();
    }
    
    // レスポンスデータ
    $response = array(
        'success' => true,
        'news' => $news_items,
        'has_more' => $news_query->max_num_pages > $page,
        'total_pages' => $news_query->max_num_pages,
        'current_page' => $page
    );
    
    wp_send_json($response);
}

// ログイン済み・未ログインユーザー両方に対応
add_action('wp_ajax_load_more_news', 'load_more_news');
add_action('wp_ajax_nopriv_load_more_news', 'load_more_news');

/**
 * AJAX用のnonce、URL、その他の設定をフロントエンドに渡す
 */
// AJAX設定を直接wp_headで出力（より確実な方法）
add_action('wp_head', function() {
    ?>
    <script>
        window.loadMoreNewsAjax = {
            ajax_url: '<?php echo admin_url('admin-ajax.php'); ?>',
            nonce: '<?php echo wp_create_nonce('load_more_news_nonce'); ?>',
            action: 'load_more_news'
        };
    </script>
    <?php
});
