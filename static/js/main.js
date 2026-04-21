// 关系网状图初始化
// 这个函数在 relationships/graph.html 里调用
function initGraph(nodes, edges) {
  const container = document.getElementById('relationship-graph');
  if (!container) return;

  const data = {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges)
  };

  const options = {
    nodes: {
      shape: 'ellipse',
      color: {
        background: '#f2ece3',
        border: '#b5746a',
        highlight: { background: '#f0ddd9', border: '#8f5a52' },
        hover: { background: '#f0ddd9', border: '#b5746a' }
      },
      font: { face: 'Lato', size: 14, color: '#3d3530' },
      borderWidth: 1.5,
      margin: 10,
    },
    edges: {
      color: { color: '#ddd5cc', highlight: '#b5746a', hover: '#b8943f' },
      font: { face: 'Lato', size: 12, color: '#6b5a52', align: 'middle' },
      smooth: { type: 'curvedCW', roundness: 0.2 },
      width: 1.5,
    },
    physics: {
      stabilization: { iterations: 100 },
      barnesHut: { gravitationalConstant: -3000, springLength: 160 }
    },
    interaction: { hover: true, tooltipDelay: 100 }
  };

  const network = new vis.Network(container, data, options);

  // 点击节点跳转到人物详情页
  network.on('click', function (params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = data.nodes.get(nodeId);
      if (node && node.url) {
        window.location.href = node.url;
      }
    }
  });

  // 鼠标悬停时显示手型光标
  network.on('hoverNode', function () {
    container.style.cursor = 'pointer';
  });
  network.on('blurNode', function () {
    container.style.cursor = 'default';
  });
}

// 动态添加自定义词条行（人物和情节共用）
let fieldCount = 0;
function addField(containerId, showFlag) {
  containerId = containerId || 'fields-container';
  const hint = document.getElementById('no-fields-hint');
  if (hint) hint.style.display = 'none';
  fieldCount++;
  const container = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = 'field-row mb-3 p-3 border rounded';
  div.style.background = '#faf8f5';
  div.id = `field-${fieldCount}`;

  let flagHtml = '';
  if (showFlag) {
    flagHtml = `
      <div class="row mt-2" id="flag-section-${fieldCount}" style="display:none !important">
        <div class="col-md-4">
          <div class="form-check">
            <input class="form-check-input" type="checkbox"
                   name="field_flagged" value="${fieldCount - 1}"
                   id="flag-check-${fieldCount}"
                   onchange="toggleFlagNote(${fieldCount})">
            <label class="form-check-label flag-label" for="flag-check-${fieldCount}">
              🔖 标记为伏笔
            </label>
          </div>
        </div>
        <div class="col-md-8" id="flag-note-${fieldCount}" style="display:none">
          <input type="text" name="field_note" class="form-control form-control-sm"
                 placeholder="提醒备注，如：第五章需回收此伏笔">
        </div>
      </div>`;
  }

  div.innerHTML = `
    <div class="row g-2 align-items-center">
      <div class="col-md-3">
        <input type="text" name="field_name" class="form-control"
               placeholder="词条名" ${showFlag ? 'onchange="showFlagSection(' + fieldCount + ')"' : ''}>
      </div>
      <div class="col-md-8">
        <input type="text" name="field_value" class="form-control" placeholder="内容">
      </div>
      <div class="col-md-1">
        <button type="button" class="btn btn-outline-danger btn-sm w-100"
                onclick="this.closest('.field-row').remove()">×</button>
      </div>
    </div>
    ${flagHtml}
  `;
  container.appendChild(div);
}

function showFlagSection(id) {
  const section = document.getElementById(`flag-section-${id}`);
  if (section) section.style.removeProperty('display');
}

function toggleFlagNote(id) {
  const checkbox = document.getElementById(`flag-check-${id}`);
  const note = document.getElementById(`flag-note-${id}`);
  if (note) note.style.display = checkbox.checked ? '' : 'none';
}
