import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

interface Program {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  program_description?: string;
  program_url?: string;
  degree_type?: string;
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

export function ProgramSearch() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [selectedDegreeType, setSelectedDegreeType] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [availableFields, setAvailableFields] = useState<{slug: string, label: string}[]>([]);

  // WordPressのREST APIエンドポイント
  const apiEndpoint = '/wp-json/wp/v2/programs';

  // プログラムデータの取得
  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        per_page: '20',
        _embed: '1'
      });

      const response = await fetch(`${apiEndpoint}?${params}`);
      if (!response.ok) {
        throw new Error('プログラムの取得に失敗しました');
      }

      const data = await response.json();
      setPrograms(data);
      
      // 利用可能な分野を抽出（スラッグとラベルのペア）

      
      const fieldMap = new Map<string, string>();
      data.forEach((program: Program) => {
        if (program.field_tags) {
          program.field_tags.forEach((tag, index) => {
            // field_labelsが存在する場合はそれを使用、なければタグをそのままラベルとして使用
            const label = program.field_labels?.[index] || FIELD_LABEL_MAP[tag] || tag;
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
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
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
  };

  // 初期データの読み込み
  useEffect(() => {
    fetchPrograms();
  }, []);

  // 初回データ読み込み時のみフィルタリング
  useEffect(() => {
    if (programs.length > 0) {
      filterPrograms();
    }
  }, [programs]);

  return (
    <div className="c-program-search">
      <h3 className="c-program-search__title">検索する</h3>
      {/* フィルター部分 */}
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

      {/* 検索結果見出し */}
      <div className="c-program-search__result-header">
        <h3 className="c-program-search__result-title">検索結果</h3>
        <span className="c-program-search__result-count">{filteredPrograms.length}件</span>
      </div>

      {loading && (
        <div className="c-program-search__loading">
          読み込み中...
        </div>
      )}

      {error && (
        <div className="c-program-search__error">
          {error}
        </div>
      )}

      <div className="c-program-search__results">
        {filteredPrograms.length === 0 && !loading && !error && (
          <div className="c-program-search__no-results">
            該当するプログラムが見つかりませんでした。
          </div>
        )}

        {(() => {
          // 学位取得の有無でプログラムをグループ化
          const withDegree = filteredPrograms.filter(program => program.degree_type === 'with');
          const withoutDegree = filteredPrograms.filter(program => program.degree_type === 'without');
          
          return (
            <>
              {withDegree.length > 0 && (
                <div className="c-program-group">
                  <h4 className="c-program-group__title">学位取得を伴うもの</h4>
                  <div className="c-program-group__items">
                    {withDegree.map((program) => (
                      <article key={program.id} className="c-program-card">
                        <div className="c-program-card__content">
                          <h3 className="c-program-card__title">
                            {program.title.rendered}
                          </h3>
                          
                          {program.program_description && (
                            <div 
                              className="c-program-card__description"
                              dangerouslySetInnerHTML={{ __html: program.program_description }}
                            />
                          )}
                          
                          <div className="c-program-card__meta">
                            {program.degree_type && (
                              <span className={`c-badge c-badge--${program.degree_type}`}>
                                {program.degree_type === 'with' ? '学位取得あり' : '学位取得なし'}
                              </span>
                            )}
                            
                            {program.program_layer && (
                              <span className={`c-badge c-badge--${program.program_layer}`}>
                                {program.program_layer === 'foundation' ? '基盤' : 
                                 program.program_layer === 'core' ? 'コア' :
                                 program.program_layer === 'collaboration' ? '連携' : 'その他'}
                              </span>
                            )}
                          </div>
                          
                          {program.field_tags && program.field_tags.length > 0 && (
                            <div className="c-program-card__tags">
                              {program.field_tags.map((tag, index) => (
                                <span key={index} className="c-tag">
                                  {program.field_labels?.[index] || FIELD_LABEL_MAP[tag] || tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {program.program_url && (
                            <a 
                              href={program.program_url}
                              className="c-program-card__link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              詳細を見る
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {withoutDegree.length > 0 && (
                <div className="c-program-group">
                  <h4 className="c-program-group__title">学位取得を伴わないもの</h4>
                  <div className="c-program-group__items">
                    {withoutDegree.map((program) => (
                      <article key={program.id} className="c-program-card">
                        <div className="c-program-card__content">
                          <h3 className="c-program-card__title">
                            {program.title.rendered}
                          </h3>
                          
                          {program.program_description && (
                            <div 
                              className="c-program-card__description"
                              dangerouslySetInnerHTML={{ __html: program.program_description }}
                            />
                          )}
                          
                          <div className="c-program-card__meta">
                            {program.degree_type && (
                              <span className={`c-badge c-badge--${program.degree_type}`}>
                                {program.degree_type === 'with' ? '学位取得あり' : '学位取得なし'}
                              </span>
                            )}
                            
                            {program.program_layer && (
                              <span className={`c-badge c-badge--${program.program_layer}`}>
                                {program.program_layer === 'foundation' ? '基盤' : 
                                 program.program_layer === 'core' ? 'コア' :
                                 program.program_layer === 'collaboration' ? '連携' : 'その他'}
                              </span>
                            )}
                          </div>
                          
                          {program.field_tags && program.field_tags.length > 0 && (
                            <div className="c-program-card__tags">
                              {program.field_tags.map((tag, index) => (
                                <span key={index} className="c-tag">
                                  {program.field_labels?.[index] || FIELD_LABEL_MAP[tag] || tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {program.program_url && (
                            <a 
                              href={program.program_url}
                              className="c-program-card__link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              詳細を見る
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}