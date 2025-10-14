import { useState, useEffect } from 'preact/hooks';

interface Program {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  program_description?: string;
  program_url?: string;
  video_url?: string;
  application_start_date?: string;
  application_end_date?: string;
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



export function ProgramSearch() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [selectedDegreeType, setSelectedDegreeType] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [availableFields, setAvailableFields] = useState<{slug: string, label: string}[]>([]);
  const [fieldLabelMap, setFieldLabelMap] = useState<{ [key: string]: string }>({});
  const [programTypeLabelMap, setProgramTypeLabelMap] = useState<{ [key: string]: string }>({});
  // ページネーション機能を無効化
  // const [currentPage, setCurrentPage] = useState<number>(1);
  // const [itemsPerPage] = useState<number>(6);

  // ラベルマッピングをAPIから取得
  const loadLabelMappings = async () => {
    try {
      const response = await fetch('/wp-json/wp/v2/label-mappings');
      const data = await response.json();
      setFieldLabelMap(data.field_labels || {});
      setProgramTypeLabelMap(data.program_type_labels || {});
    } catch (error) {
      console.error('ラベルマッピングの取得に失敗しました:', error);
    }
  };

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
            const label = program.field_labels?.[index] || fieldLabelsMap[tag] || fieldLabelMap[tag] || tag;
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
    // setCurrentPage(1); // ページネーション無効化のためコメントアウト
    
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

  // ページネーション用の関数（無効化）
  // const getPaginatedPrograms = (programs: Program[]) => {
  //   const startIndex = (currentPage - 1) * itemsPerPage;
  //   const endIndex = startIndex + itemsPerPage;
  //   return programs.slice(startIndex, endIndex);
  // };

  // const getTotalPages = (totalItems: number) => {
  //   return Math.ceil(totalItems / itemsPerPage);
  // };

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  //   // ページ変更時に最上部にスクロール
  //   const searchResults = document.getElementById('filtered-results');
  //   if (searchResults) {
  //     searchResults.scrollIntoView({ behavior: 'smooth' });
  //   }
  // };

  // ページャーコンポーネント（無効化）
  const renderPagination = (totalItems: number) => {
    // 全件表示のためページネーション無効化
    return null;
  };

  // 初期データの読み込み
  useEffect(() => {
    loadLabelMappings();
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
                const withDegree = filteredPrograms.filter(program => 
                  program.degree_type === 'with' && 
                  (program.program_type === 'professional' || program.program_type === 'special')
                );
                const withoutDegree = filteredPrograms.filter(program => 
                  program.degree_type === 'without' && program.program_type !== 'professional'
                );
                
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
                  
                  // 表示順序を定義
                  const typeOrder = ['interdisciplinary', 'other_recurrent', 'professional', 'special'];
                  const orderedGroups: { [key: string]: Program[] } = {};
                  
                  // 定義された順序でグループを並べ替え
                  typeOrder.forEach(type => {
                    if (groups[type]) {
                      orderedGroups[type] = groups[type];
                    }
                  });
                  
                  // 定義されていないタイプがあれば最後に追加
                  Object.keys(groups).forEach(type => {
                    if (!typeOrder.includes(type)) {
                      orderedGroups[type] = groups[type];
                    }
                  });
                  
                  return orderedGroups;
                };

                // 全件表示：フィルタリングされた全プログラムを表示
                const paginatedPrograms = filteredPrograms;

                // カードコンポーネント
                const renderProgramCard = (program: Program) => (
                  <div 
                    key={program.id} 
                    className="c-program-card"
                  >
                    {/* 1. ヘッダー（タグ） */}
                    <div className="c-program-card__header">
                      {program.field_tags && program.field_tags.length > 0 && (
                        <span className="c-program-card__category">
                          {program.field_labels?.[0] || fieldLabelMap[program.field_tags[0]] || program.field_tags[0]}
                        </span>
                      )}
                    </div>

                    {/* 2. タイトル */}
                    <div className="c-program-card__title">
                      <h5>
                        {program.title.rendered}
                      </h5>
                    </div>

                    {/* 3. 画像 */}
                    <div className="c-program-card__image">
                      <a 
                        href={program.program_url || '#'} 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
                      </a>
                    </div>

                    {/* 4. フッター（募集期間と動画アイコン） */}
                    <div className={`c-program-card__footer ${program.video_url ? 'c-program-card__footer--video' : ''}`}>
                      <span>
                        応募期間：
                        {program.application_start_date && program.application_end_date 
                          ? `${program.application_start_date}〜${program.application_end_date}`
                          : '未定'
                        }
                      </span>
                      {program.video_url && (
                        <a 
                          href={program.video_url} 
                          className="c-program-card__video-icon"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="動画を視聴する"
                        >
                          <img 
                            src="/wp-content/themes/dist/assets/images/ico_video.svg" 
                            alt="動画アイコン"
                          />
                        </a>
                      )}
                    </div>
                  </div>
                );

                // ページネーション用：現在ページのプログラムを学位取得で分ける
                const paginatedWithDegree = paginatedPrograms.filter(program => 
                  program.degree_type === 'with' && 
                  (program.program_type === 'professional' || program.program_type === 'special')
                );
                const paginatedWithoutDegree = paginatedPrograms.filter(program => 
                  program.degree_type === 'without' && program.program_type !== 'professional'
                );

                return (
                  <>
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
                                {programTypeLabelMap[typeKey] || typeKey}
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
                                {programTypeLabelMap[typeKey] || typeKey}
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