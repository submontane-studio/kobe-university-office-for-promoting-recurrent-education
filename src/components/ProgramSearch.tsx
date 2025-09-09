import { useState, useEffect } from 'preact/hooks';

interface Program {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  program_description?: string;
  program_url?: string;
  degree_type?: string;
  program_type?: string;
  program_layer?: string;
  field_tags?: string[];
  field_labels?: string[];
  _embedded?: {
    'wp:featuredmedia'?: [{
      source_url: string;
      alt_text: string;
    }];
  };
}

// スラッグから日本語ラベルへのマッピング
const FIELD_LABEL_MAP: { [key: string]: string } = {
  'health': '健康科学',
  'mathematics': '数理・データサイエンス',
  'science': '理工学',
};

// プログラムタイプから日本語ラベルへのマッピング
const PROGRAM_TYPE_LABEL_MAP: { [key: string]: string } = {
  'interdisciplinary': '異分野共創・価値創造・リカレント教育プログラム',
  'other_recurrent': 'その他のリカレント・リスキリング特別プログラム',
  'professional': '専門職大学院',
  'special': '社会人向け特別プログラム'
};

export function ProgramSearch() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [selectedDegreeType, setSelectedDegreeType] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [availableFields, setAvailableFields] = useState<{slug: string, label: string}[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6); // 1ページあたりの表示件数

  // WordPressから渡されたデータを取得
  const loadProgramsData = () => {
    try {
      // window.programsDataからデータを取得
      const programsData = (window as any).programsData || [];
      const fieldLabelsMap = (window as any).fieldLabelsMap || {};
      
      setPrograms(programsData);
      
      // 利用可能な分野を抽出（スラッグとラベルのペア）
      const fieldMap = new Map<string, string>();
      programsData.forEach((program: Program) => {
        if (program.field_tags) {
          program.field_tags.forEach((tag, index) => {
            // field_labelsが存在する場合はそれを使用、なければマッピングまたはタグをそのままラベルとして使用
            const label = program.field_labels?.[index] || fieldLabelsMap[tag] || FIELD_LABEL_MAP[tag] || tag;
            fieldMap.set(tag, label);
          });
        }
      });
      
      const fields = Array.from(fieldMap.entries()).map(([slug, label]) => ({
        slug,
        label
      })).sort((a, b) => a.label.localeCompare(b.label));
      
      setAvailableFields(fields);
    } catch (err) {
      console.error('プログラムデータの読み込みに失敗しました:', err);
    }
  };

  // フィルター処理
  const filterPrograms = () => {
    let filtered = programs;

    if (selectedLayer !== 'all') {
      filtered = filtered.filter(program => program.program_layer === selectedLayer);
    }

    if (selectedDegreeType !== 'all') {
      filtered = filtered.filter(program => program.degree_type === selectedDegreeType);
    }

    if (selectedField !== 'all') {
      filtered = filtered.filter(program => 
        program.field_tags && program.field_tags.includes(selectedField)
      );
    }

    setFilteredPrograms(filtered);
  };

  // 検索ボタンクリック時の処理
  const handleSearch = () => {
    filterPrograms();
    setCurrentPage(1); // 検索時はページを1に戻す
    
    // 初期表示を隠してフィルタリング結果を表示
    const initialDisplay = document.getElementById('programs-initial-display');
    const filteredResults = document.getElementById('filtered-results');
    
    if (initialDisplay) {
      initialDisplay.style.display = 'none';
    }
    if (filteredResults) {
      filteredResults.style.display = 'block';
    }
  };

  // ページネーション用の関数
  const getPaginatedPrograms = (programs: Program[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return programs.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // ページ変更時に最上部にスクロール
    const searchResults = document.getElementById('filtered-results');
    if (searchResults) {
      searchResults.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ページャーコンポーネント
  const renderPagination = (totalItems: number) => {
    const totalPages = getTotalPages(totalItems);
    
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }


    // 最初のページ
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="c-pagination__button"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="c-pagination__ellipsis">…</span>
        );
      }
    }

    // ページ番号
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`c-pagination__button ${i === currentPage ? 'c-pagination__button--active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // 最後のページ
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="c-pagination__ellipsis">…</span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="c-pagination__button"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }


    return (
      <div className="c-pagination">
        <div className="c-pagination__buttons">
          {pages}
        </div>
      </div>
    );
  };

  // 初期データの読み込み
  useEffect(() => {
    loadProgramsData();
  }, []);

  // 初回データ読み込み時のみフィルタリングと表示
  useEffect(() => {
    if (programs.length > 0) {
      filterPrograms();
      // 初期表示として filtered-results を表示
      const filteredResults = document.getElementById('filtered-results');
      if (filteredResults) {
        filteredResults.style.display = 'block';
      }
    }
  }, [programs]);

  return (
    <div className="c-program-search-filters-only">
      {/* タイトル */}
      <h2 className="c-program-search__title">検索する</h2>
      
      {/* フィルター部分のみ */}
      <div className="c-program-search__filters">
        {/* 学位取得フィルター */}
        <div className="c-program-search__filter-group">
          <label htmlFor="degree-select" className="c-program-search__filter-label">学位取得</label>
          <div className="c-select-wrapper">
            <span className="c-select-icon"></span>
            <select 
              id="degree-select"
              className="c-select"
              value={selectedDegreeType}
              onChange={(e) => setSelectedDegreeType((e.target as HTMLSelectElement).value)}
            >
              <option value="all">すべて</option>
              <option value="with">あり</option>
              <option value="without">なし</option>
            </select>
          </div>
        </div>

        {/* プログラム層フィルター */}
        <div className="c-program-search__filter-group">
          <label htmlFor="layer-select" className="c-program-search__filter-label">プログラム層</label>
          <div className="c-select-wrapper">
            <span className="c-select-icon"></span>
            <select 
              id="layer-select"
              className="c-select"
              value={selectedLayer}
              onChange={(e) => setSelectedLayer((e.target as HTMLSelectElement).value)}
            >
              <option value="all">すべて</option>
              <option value="foundation">基盤</option>
              <option value="core">コア</option>
              <option value="collaboration">連携</option>
            </select>
          </div>
        </div>

        {/* 分野フィルター */}
        {availableFields.length > 0 && (
          <div className="c-program-search__filter-group">
            <fieldset className="c-fieldset">
              <legend className="c-program-search__filter-label">分野</legend>
              <div className="c-radio-group">
                <label className="c-radio-group__item">
                  <input 
                    type="radio" 
                    name="field" 
                    value="all"
                    className="c-radio-group__input"
                    checked={selectedField === 'all'}
                    onChange={(e) => setSelectedField((e.target as HTMLInputElement).value)}
                  />
                  <span className="c-radio-group__label">すべて</span>
                </label>
                {availableFields.map((field) => (
                  <label key={field.slug} className="c-radio-group__item">
                    <input 
                      type="radio" 
                      name="field" 
                      value={field.slug}
                      className="c-radio-group__input"
                      checked={selectedField === field.slug}
                      onChange={(e) => setSelectedField((e.target as HTMLInputElement).value)}
                    />
                    <span className="c-radio-group__label">{field.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {/* 検索ボタン */}
        <div className="c-program-search__filter-group">
          <button 
            type="button"
            className="c-search-button"
            onClick={handleSearch}
          >
            検索する
          </button>
        </div>
      </div>

      {/* フィルタリング後の結果を表示 */}
      <div id="filtered-results" style={{ display: 'none' }}>
        <div className="c-program-search">
          {/* 検索結果ヘッダー */}
          <div className="c-program-search__result-header">
            <h2 className="c-program-search__result-title">検索結果</h2>
            <span className="c-program-search__result-count">{filteredPrograms.length}件</span>
          </div>
          
          <div className="c-program-search__results">
            {filteredPrograms.length === 0 ? (
              <div className="c-program-search__no-results">
                該当するプログラムが見つかりませんでした。
              </div>
            ) : (
              (() => {
                // 学位取得の有無とプログラムタイプでプログラムをグループ化
                const withDegree = filteredPrograms.filter(program => program.degree_type === 'with');
                const withoutDegree = filteredPrograms.filter(program => program.degree_type === 'without');
                
                // プログラムタイプでグループ化する関数（ページネーションなし）
                const groupByProgramType = (programs: Program[]) => {
                  const groups: { [key: string]: Program[] } = {};
                  programs.forEach(program => {
                    const type = program.program_type || 'unknown';
                    if (!groups[type]) {
                      groups[type] = [];
                    }
                    groups[type].push(program);
                  });
                  return groups;
                };

                // ページネーション用：全体のプログラムリストから現在ページの分を抽出
                const paginatedPrograms = getPaginatedPrograms(filteredPrograms);

                // カードコンポーネント
                const renderProgramCard = (program: Program) => (
                  <a 
                    key={program.id} 
                    href={program.program_url || '#'} 
                    className="c-program-card"
                    target="_blank"
                    rel="noopener noreferrer">
                    {/* 1. ヘッダー（タグ） */}
                    <div className="c-program-card__header">
                      <span className="c-program-card__category">
                        {program.field_tags && program.field_tags.length > 0 
                          ? (program.field_labels?.[0] || (program.field_tags[0] && FIELD_LABEL_MAP[program.field_tags[0]]) || program.field_tags[0])
                          : '人文学'
                        }
                      </span>
                    </div>

                    {/* 2. タイトル */}
                    <div className="c-program-card__title">
                      <h5>
                        {program.title.rendered}
                      </h5>
                    </div>

                    {/* 3. 画像 */}
                    <div className="c-program-card__image">
                      <img 
                        src={
                          program._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
                          '/wp-content/themes/kobe-u/assets/images/noimage.png'
                        }
                        alt={
                          program._embedded?.['wp:featuredmedia']?.[0]?.alt_text ||
                          'プログラム画像'
                        }
                        loading="lazy"
                      />
                    </div>

                    {/* 4. フッター（募集期間） */}
                    <div className={`c-program-card__footer ${program.program_url && program.program_url.includes('vimeo') ? 'c-program-card__footer--video' : ''}`}>
                      <span>応募期間：2025/9/20〜2026/1/2</span>
                    </div>
                  </a>
                );

                // ページネーション用：現在ページのプログラムを学位取得で分ける
                const paginatedWithDegree = paginatedPrograms.filter(program => program.degree_type === 'with');
                const paginatedWithoutDegree = paginatedPrograms.filter(program => program.degree_type === 'without');

                return (
                  <>
                    {paginatedWithDegree.length > 0 && (
                      <div className="c-program-group">
                        <div className="c-program-group__title-wrapper">
                          <h3 className="c-program-group__title">学位取得を目指すもの</h3>
                        </div>
                        {(() => {
                          const typeGroups = groupByProgramType(paginatedWithDegree);
                          return Object.entries(typeGroups).map(([typeKey, programs]) => (
                            <div key={typeKey} className="c-program-type-group">
                              <h4 className="c-program-type-group__title">
                                {PROGRAM_TYPE_LABEL_MAP[typeKey] || typeKey}
                              </h4>
                              <div className="c-programs-grid">
                                {programs.length > 0 ? (
                                  programs.map(renderProgramCard)
                                ) : (
                                  <div className="c-no-results">
                                    このカテゴリに条件に一致する結果が見つかりません
                                  </div>
                                )}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}

                    {paginatedWithoutDegree.length > 0 && (
                      <div className="c-program-group">
                        <div className="c-program-group__title-wrapper">
                          <h3 className="c-program-group__title">学位取得を伴わないもの</h3>
                        </div>
                        {(() => {
                          const typeGroups = groupByProgramType(paginatedWithoutDegree);
                          return Object.entries(typeGroups).map(([typeKey, programs]) => (
                            <div key={typeKey} className="c-program-type-group">
                              <h4 className="c-program-type-group__title">
                                {PROGRAM_TYPE_LABEL_MAP[typeKey] || typeKey}
                              </h4>
                              <div className="c-programs-grid">
                                {programs.length > 0 ? (
                                  programs.map(renderProgramCard)
                                ) : (
                                  <div className="c-no-results">
                                    このカテゴリに条件に一致する結果が見つかりません
                                  </div>
                                )}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}

                    {/* ページャー */}
                    {renderPagination(filteredPrograms.length)}
                  </>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}