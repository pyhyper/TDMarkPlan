const Ielts = {
    topics: [
        ['Education','Trường học, đại học, thi cử'], ['Technology','AI, Internet, smartphone'],
        ['Environment','Ô nhiễm, biến đổi khí hậu'], ['Health','Sức khỏe, ăn uống, thể thao'],
        ['Work & Career','Việc làm, lương, cân bằng công việc và cuộc sống'], ['Family & Children','Nuôi dạy trẻ, vai trò cha mẹ'],
        ['Society','Tội phạm, bất bình đẳng, lối sống'], ['Government','Chi tiêu công, dịch vụ công'],
        ['Media & Advertising','Quảng cáo, mạng xã hội, tin tức'], ['Globalization & Culture','Văn hóa, du lịch, toàn cầu hóa']
    ],
    // Teaching outlines, not memorised model answers or an exhaustive official taxonomy.
    groups: {
        listening: {title:'Listening — 6 nhóm dạng bài', rows:[
            ['Multiple choice','Chọn một hoặc nhiều đáp án theo yêu cầu.','Đọc lựa chọn → nghe paraphrase → loại bẫy → kiểm tra số đáp án.'],
            ['Matching','Ghép thông tin nghe được với các lựa chọn.','Xác định đối tượng → theo dõi người nói → ghép đúng chữ cái.'],
            ['Plan / map / diagram labelling','Điền nhãn sơ đồ hoặc bản đồ.','Xác định điểm xuất phát → theo hướng/vị trí → điền nhãn.'],
            ['Form / note / table / flow-chart completion','Hoàn thành biểu mẫu, ghi chú, bảng hoặc sơ đồ.','Dự đoán loại từ/số → nghe thông tin → kiểm tra spelling và giới hạn từ.'],
            ['Sentence completion','Điền phần còn thiếu trong câu.','Đọc ngữ cảnh → nghe từ cần điền → kiểm tra ngữ pháp và giới hạn từ.'],
            ['Short-answer questions','Trả lời ngắn theo bản ghi âm.','Xác định thông tin cần tìm → trả lời đúng số từ/số cho phép.']
        ]},
        speaking: {title:'Speaking — Part 1, 2, 3', rows:[
            ['Part 1 — Interview','Chủ đề quen thuộc: bản thân, nhà ở, học tập, công việc.','Trả lời trực tiếp → lý do/chi tiết → ví dụ ngắn nếu phù hợp.'],
            ['Part 2 — Long turn','Cue card: người, nơi chốn, đồ vật, sự kiện hoặc trải nghiệm.','Chuẩn bị ý 1 phút → nói 1–2 phút theo gợi ý → nối ý tự nhiên.'],
            ['Part 3 — Discussion','Câu hỏi khái quát: nguyên nhân, so sánh, đánh giá, dự đoán.','Quan điểm → giải thích → ví dụ → mặt khác hoặc điều kiện khi cần.']
        ]},
        reading: {title:'Reading — các dạng câu hỏi', rows:[
            ['Multiple choice','Chọn đáp án đúng theo bài đọc.','Định vị đoạn → đọc kỹ → loại đáp án không có bằng chứng.'],
            ['True / False / Not Given','Kiểm tra thông tin thực tế.','Đúng với bài / mâu thuẫn / không đủ thông tin; không dùng kiến thức ngoài.'],
            ['Yes / No / Not Given','Kiểm tra quan điểm hoặc nhận định của tác giả.','Tìm quan điểm → đồng ý / trái ngược / không được nêu.'],
            ['Matching information','Ghép chi tiết với đoạn văn.','Scan chi tiết → xác nhận bằng chứng → chọn đoạn.'],
            ['Matching headings','Ghép tiêu đề với ý chính đoạn.','Đọc ý bao quát → phân biệt ý chính và ví dụ → chọn heading.'],
            ['Matching features','Ghép đặc điểm, người, sự vật hoặc quan điểm.','Định vị đối tượng → đọc mối liên hệ → ghép lựa chọn.'],
            ['Matching sentence endings','Ghép nửa đầu với phần kết câu.','Định vị ý → kiểm tra nghĩa và ngữ pháp → chọn phần kết.'],
            ['Sentence completion','Điền từ vào câu.','Lấy thông tin từ bài → giữ đúng giới hạn từ và ngữ pháp.'],
            ['Summary / note / table / flow-chart completion','Hoàn thành tóm tắt, ghi chú, bảng hoặc sơ đồ.','Nhận biết ý đang tóm tắt → tìm bằng chứng → điền từ/chọn đáp án theo đề.'],
            ['Diagram label completion','Điền nhãn hình minh họa.','Đọc mô tả vị trí/thành phần → nối với hình → điền nhãn.'],
            ['Short-answer questions','Câu trả lời ngắn.','Định vị thông tin → trả lời theo giới hạn từ/số của đề.']
        ]},
        academic: {title:'Writing Task 1 — Academic', rows:[
            ['Line Graph','Thường Dynamic: theo dõi thay đổi theo thời gian; kiểm tra trục.','Introduction → Overview xu hướng chính → 2 nhóm chi tiết, có số liệu so sánh.'],
            ['Bar Chart','Dynamic nếu nhiều mốc thời gian; Static nếu so sánh tại một thời điểm.','Introduction → Overview → nhóm số liệu nổi bật và so sánh phù hợp.'],
            ['Pie Chart','Dynamic hoặc Static tùy mốc thời gian.','Introduction → Overview cơ cấu → nhóm tỷ trọng lớn/nhỏ và thay đổi nếu có.'],
            ['Table','Dynamic hoặc Static tùy dữ liệu.','Introduction → Overview → chọn số liệu nổi bật, không liệt kê mọi ô.'],
            ['Mixed Charts','Dynamic hoặc Static; xem thời gian và quan hệ giữa các biểu đồ.','Introduction → Overview chung → nhóm chi tiết có liên hệ, không bỏ biểu đồ nào.'],
            ['Map','Có thể so sánh thay đổi qua thời gian hoặc bố trí tại một thời điểm.','Introduction → Overview bố cục/thay đổi lớn → nhóm vị trí, công trình và so sánh.'],
            ['Natural process','Quá trình tự nhiên: vòng đời, chu trình nước… Không ép vào Static/Dynamic.','Introduction → Overview tuyến tính/chu kỳ → mô tả các giai đoạn theo thứ tự, dùng chủ động/bị động phù hợp.'],
            ['Man-made process','Quy trình do con người tạo: sản xuất, tái chế… Không ép vào Static/Dynamic.','Introduction → Overview đầu vào/đầu ra và các giai đoạn chính → mô tả từng chặng, dùng bị động khi phù hợp.']
        ]},
        general: {title:'Writing Task 1 — General Training', rows:[
            ['Formal letter','Viết cho tổ chức hoặc người không quen: yêu cầu, khiếu nại…','Lời chào phù hợp → mục đích → đủ các gạch đầu dòng của đề → kết thư trang trọng.'],
            ['Semi-formal letter','Viết cho người quen trong bối cảnh công việc/dịch vụ.','Lời chào → mục đích → giải thích đủ ý → đề nghị/kết thư với giọng lịch sự.'],
            ['Informal letter','Viết cho bạn bè/người thân: mời, cảm ơn, chia sẻ…','Lời chào thân mật → mục đích → đủ các ý yêu cầu → kết thư tự nhiên.']
        ]},
        task2: {title:'Writing Task 2 — 5 nhóm câu hỏi để luyện', rows:[
            ['Opinion','To what extent do you agree or disagree?','Mở bài nêu lập trường → các đoạn lý do có giải thích/ví dụ → kết luận nhất quán.'],
            ['Discussion','Discuss both views and give your own opinion.','Mở bài → phân tích quan điểm 1 → quan điểm 2 → kết luận; thể hiện ý kiến cá nhân rõ ràng.'],
            ['Advantages & Disadvantages','What are the advantages and disadvantages?','Mở bài → ưu điểm → nhược điểm → kết luận. Nếu hỏi outweigh, phải cân nhắc và kết luận bên nào lớn hơn.'],
            ['Problems & Solutions','What problems does this cause? What solutions can be taken?','Mở bài → vấn đề → giải pháp tương ứng → kết luận; nếu hỏi nguyên nhân thì trả lời cả nguyên nhân.'],
            ['Two-part Question','Why is this the case? Is this a positive or negative development?','Mở bài → trả lời đầy đủ câu 1 → trả lời đầy đủ câu 2 → kết luận. Điều chỉnh theo đúng hai câu được hỏi.']
        ]}
    },
    init() {
        const host = document.getElementById('ielts-format-groups');
        for (const [key,group] of Object.entries(this.groups)) {
            const details = document.createElement('details'); details.className='ielts-format-section'; details.id='ielts-group-'+key;
            const summary=document.createElement('summary'); summary.textContent=group.title;
            const scroll=document.createElement('div'); scroll.className='ielts-format-scroll';
            const table=document.createElement('table'); table.className='ielts-format-table';
            const head=document.createElement('thead'); const row=document.createElement('tr');
            for(const name of ['Ưu tiên dạng bài','Đề bài / đặc điểm','Khung luyện tập gợi ý']) {const th=document.createElement('th');th.scope='col';th.textContent=name;row.append(th);}
            head.append(row); table.append(head);
            const body=document.createElement('tbody');
            for(const [name,cue,format] of group.rows) {
                const tr=document.createElement('tr'); const cell=document.createElement('td'); const label=document.createElement('label');
                const input=document.createElement('input');input.type='checkbox';input.name='ielts-format-'+key;input.value=name;input.checked=true;
                label.append(input,document.createTextNode(' '+name));cell.append(label);tr.append(cell);
                for(const text of [cue,format]) {const td=document.createElement('td');td.textContent=text;tr.append(td);}
                body.append(tr);
            }
            table.append(body);scroll.append(table);details.append(summary,scroll);host.append(details);
        }
        const topics=document.getElementById('ielts-task2-topics');
        for(const [name,example] of this.topics) {
            const label=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.name='ielts-topic';input.value=name;input.checked=true;input.setAttribute('aria-label',name);
            const text=document.createElement('span');const strong=document.createElement('strong');strong.textContent=name;const small=document.createElement('small');small.textContent=example;text.append(strong,small);label.append(input,text);topics.append(label);
        }
        document.getElementById('ielts-test-type').addEventListener('change',()=>this.updateType());
        this.updateType();
    },
    updateType() {
        const type=document.getElementById('ielts-test-type').value;
        if (typeof App !== 'undefined' && App.selectedDomain === 'ielts') document.getElementById('btn-wiz-instant-sample').hidden = type !== 'academic';
        for(const key of ['academic','general']) {
            const section=document.getElementById('ielts-group-'+key);section.hidden=type!==key;
            section.querySelectorAll('input').forEach(input=>{input.disabled=type!==key;});
        }
        document.getElementById('ielts-format-summary').textContent = type==='academic'
            ? 'Academic: Reading dùng văn bản học thuật phổ thông; Writing Task 1 mô tả dữ liệu/hình, Task 2 viết bài luận. Listening và Speaking dùng chung định dạng với General Training.'
            : type==='general' ? 'General Training: Reading tập trung đời sống, công việc và văn bản dài; Writing Task 1 viết thư, Task 2 viết bài luận. Listening và Speaking dùng chung định dạng với Academic.'
            : 'Chọn loại thi để hiện đúng Writing Task 1 và bối cảnh Reading. Nếu chưa rõ, AI sẽ hỏi trước khi lập lịch chuyên biệt.';
    },
    selected(name) { return Array.from(document.querySelectorAll(`[name="${name}"]:checked:not(:disabled)`)).map(el=>el.value); },
    prompt() {
        const type=document.getElementById('ielts-test-type').value;
        const targetBandEl = document.getElementById('ielts-target-band');
        const targetBand = (targetBandEl && targetBandEl.value) ? targetBandEl.value : '';
        const lines=[`Loại thi IELTS: ${type==='academic'?'Academic':type==='general'?'General Training':'chưa xác định — hỏi người dùng trước, không mặc định Academic'}.`];
        if (targetBand && targetBand !== type) {
            lines.push(`Mục tiêu điểm số IELTS: ${targetBand}. Lộ trình và mức độ thử thách của bài tập phải hướng đến đạt được mức điểm mục tiêu này.`);
        }
        lines.push(type==='academic' ? 'Reading: văn bản học thuật phổ thông. Writing Task 1: mô tả dữ liệu, bản đồ hoặc quy trình; tối thiểu 150 từ khi luyện bài đầy đủ.' : type==='general' ? 'Reading: đời sống, công việc, văn bản dài. Writing Task 1: thư đúng người nhận và giọng văn; tối thiểu 150 từ khi luyện bài đầy đủ. Không đưa biểu đồ/process Academic vào Task 1 General Training.' : 'Chưa rõ loại thi: chỉ lên phần chung/đánh giá đầu vào; hỏi trước khi chọn Reading và Writing Task 1.');
        lines.push('Listening và Speaking có cùng định dạng ở hai loại thi. Task 2: bài luận tối thiểu 250 từ khi luyện bài đầy đủ. Với buổi ngắn, có thể chỉ luyện một đoạn hoặc một kỹ năng nhỏ, ghi rõ không phải full test. Nếu chưa xác định loại thi, task đầu yêu cầu người dùng xác nhận Academic/General; chưa lên lịch Task 1 riêng trước bước này.');
        const keys=['listening','speaking','reading',...(type==='academic'?['academic']:type==='general'?['general']:[]),'task2'];
        for(const key of keys) {
            const chosen=this.selected('ielts-format-'+key);
            lines.push(`${this.groups[key].title} — ${chosen.length?'ưu tiên: '+chosen.join(', '):'chưa ưu tiên riêng; phân bổ theo thời gian và kỹ năng yếu'}.`);
            const rows=chosen.length?this.groups[key].rows.filter(row=>chosen.includes(row[0])):this.groups[key].rows;
            for(const [name,cue,format] of rows) lines.push(`- ${name}: ${cue} Khung: ${format}`);
        }
        const topics=this.selected('ielts-topic');
        lines.push('10 chủ đề luyện Task 2 (không phải dự đoán đề hay xếp hạng tần suất chính thức): '+this.topics.map(([name,example])=>`${name} (${example})`).join('; ')+'.');
        lines.push('Chủ đề ưu tiên: '+(topics.join(', ')||'chưa chọn riêng; luân phiên phù hợp thời gian')+'.');
        lines.push('Các khung trên là gợi ý học, không phải đáp án thuộc lòng. Năm nhóm Task 2 là cách phân loại luyện tập, đề thực tế có thể kết hợp yêu cầu. Mỗi task ghi trong description: kỹ năng, loại thi, dạng bài, chủ đề, cách làm, đầu ra và tiêu chí tự kiểm tra. Task nghe cần nguồn audio; không giả vờ đã nghe nếu không có audio. Ghi nguồn bài luyện chính thức hoặc yêu cầu người dùng cung cấp, không bịa link/đề thật. Không tự tạo subtask hoặc ghi chú.');
        return lines.join('\n');
    }
};
