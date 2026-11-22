const validMasterItems = [
    {
        id: '1',
        품명: '불도저',
        규격: '',
        buttons: [
            { name: '운전경비', link: 'https://study-with-words.blogspot.com/2026/09/blog-post_23.html?group=group3&sub=sub3' },
            { name: '시간당작업량', link: 'https://study-with-words.blogspot.com/2026/10/blog-post_408.html?group=group3&sub=sub3' }
        ],
        detail: `
            재료비:  {{운전경비.재료비}}원/hr  ÷  {{시간당작업량.Q}}m3/hr  =  {{재료비}}원/m3
            노무비:  {{운전경비.노무비}}원/hr  ÷  {{시간당작업량.Q}}m3/hr  =  {{노무비}}원/m3
            경　비:  {{운전경비.경비}}원/hr  ÷  {{시간당작업량.Q}}m3/hr  =  {{경비}}원/m3
            합　계:  {{합계}}원/m3
        `,
    },
    {
        id: '2', 품명: '리퍼(유압식)', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '3', 품명: '굴삭기', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '4', 품명: '트랜처', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '5', 품명: '로더', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '6', 품명: '모터 스크레이퍼', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '7', 품명: '모터 그레이더', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '8', 품명: '덤프트럭', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '9', 품명: '롤러', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '10', 품명: '아스팔트 플랜트', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '11', 품명: '스테이빌라이저(노상안정기)', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '12', 품명: '크러셔', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '13', 품명: '대형브레이커', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '14', 품명: '압쇄기(콘크리트 소활용)', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '15', 품명: '법면다짐기', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '16', 품명: '골재세척설비', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '17', 품명: '콘크리트 믹서', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '18', 품명: '콘크리트 배치플랜트(강제혼합식)', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '19', 품명: '콘크리트 운반', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '20', 품명: '기관차', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '21', 품명: '경운기', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '22', 품명: '디젤 파일 해머', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '23', 품명: '유압 파일 해머', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '24', 품명: '진동파일 해머', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '25', 품명: '진동파일 해머(워터제트 병용 압입공)', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '26', 품명: '유압식 압입 인발기(유압식 압입 인발공)', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '27', 품명: '수중펌프', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '28', 품명: '터널전단면 굴착기', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '29', 품명: '펌프식 준설선', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '30', 품명: '그래브 준설선', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '31', 품명: '쇄암선(중추식)', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '32', 품명: '이동식 임목파쇄기', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
    {
        id: '33', 품명: '하천골재채취선', 규격: '', isOpen: false,
        buttons: [
            { name: '운전경비', link: '#' },
            { name: '작업량', link: '#' }
        ],
    },
]
