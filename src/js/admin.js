/**
 * 管理画面用JavaScript - プログラムタイプの連動制御
 * 学位取得フィールドの値に応じて、プログラムタイプの選択肢を制御する
 */

// ACFフィールドを見つけるためのメイン関数
function initializeProgramTypeControl() {
    // 複数のセレクタパターンを試す
    const possibleSelectors = [
        'select[name="acf[field_degree_type]"]',
        'select[name*="degree_type"]',
        'select[data-name="degree_type"]',
        'select#acf-field_degree_type',
        'select[id*="degree_type"]'
    ];
    
    let degreeTypeField = null;
    let programTypeField = null;
    
    // degree_type フィールドを探す
    for (const selector of possibleSelectors) {
        degreeTypeField = document.querySelector(selector);
        if (degreeTypeField) break;
    }
    
    // program_type フィールドを探す
    const programSelectors = possibleSelectors.map(s => s.replace('degree_type', 'program_type'));
    for (const selector of programSelectors) {
        programTypeField = document.querySelector(selector);
        if (programTypeField) break;
    }
    
    if (!degreeTypeField || !programTypeField) {
        return;
    }
    
    // プログラムタイプの選択肢定義
    const programTypeOptions = {
        'with': {
            'professional': '専門職大学院',
            'special': '社会人向け特別プログラム'
        },
        'without': {
            'interdisciplinary': '異分野共創・価値創造・リカレント教育プログラム',
            'other_recurrent': 'その他のリカレント・リスキリング特別プログラム'
        },
        'all': {
            'interdisciplinary': '異分野共創・価値創造・リカレント教育プログラム',
            'other_recurrent': 'その他のリカレント・リスキリング特別プログラム',
            'professional': '専門職大学院',
            'special': '社会人向け特別プログラム'
        }
    };
    
    /**
     * プログラムタイプの選択肢を更新する
     * @param {string} degreeType - 学位取得の値 ('with' | 'without' | 'all')
     */
    function updateProgramTypeOptions(degreeType) {
        // 現在の選択値を保持
        const currentValue = programTypeField.value;
        
        // 既存のoptionをすべて削除
        programTypeField.innerHTML = '';
        
        // 新しい選択肢を追加
        const availableOptions = programTypeOptions[degreeType] || programTypeOptions['all'];
        
        
        // 使用可能な選択肢を追加
        Object.entries(availableOptions).forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            programTypeField.appendChild(option);
        });
        
        // 以前の選択値が新しい選択肢に含まれている場合は復元
        if (availableOptions[currentValue]) {
            programTypeField.value = currentValue;
        } else {
            // 含まれていない場合は最初の選択肢を選択
            const firstValue = Object.keys(availableOptions)[0];
            if (firstValue) {
                programTypeField.value = firstValue;
            }
        }
        
        // 変更イベントをトリガー（他のスクリプトが依存している場合のため）
        programTypeField.dispatchEvent(new Event('change'));
    }
    
    // 学位取得フィールドの変更イベントリスナー
    degreeTypeField.addEventListener('change', function() {
        updateProgramTypeOptions(this.value);
    });
    
    // 初期化：ページロード時に現在の値に基づいて選択肢を設定
    const initialDegreeType = degreeTypeField.value || 'all';
    updateProgramTypeOptions(initialDegreeType);
}

// 複数の初期化タイミングを試す
document.addEventListener('DOMContentLoaded', initializeProgramTypeControl);

// ACFが読み込まれた後に実行
if (typeof acf !== 'undefined') {
    acf.add_action('ready', initializeProgramTypeControl);
}

// 遅延実行（ACFフィールドの遅延読み込み対応）
setTimeout(initializeProgramTypeControl, 1000);

// MutationObserverでDOMの変化を監視
const observer = new MutationObserver(function(mutations) {
    const hasNewSelect = mutations.some(mutation => 
        mutation.type === 'childList' && 
        Array.from(mutation.addedNodes).some(node => 
            node.nodeType === 1 && 
            (node.tagName === 'SELECT' || node.querySelector && node.querySelector('select'))
        )
    );
    
    if (hasNewSelect) {
        setTimeout(initializeProgramTypeControl, 500);
    }
});

observer.observe(document.body, { childList: true, subtree: true });