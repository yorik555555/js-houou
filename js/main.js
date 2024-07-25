
$(function(){
	const page_type = $('.contents').attr('id');
	const param_key = location.search.substring(1).split('=')[0];
	const param_value = location.search.substring(1).split('=')[1];
	const categorys = ['men', 'woman', 'kids'];

	let more_count = {
		'brand':3,
		'items':10
	}

	function moreControl(el, num) {
		const more_type = $(el).attr('data-more-btn');
		const target_list = $(`[data-more-list="${more_type}"]`);
		const max_count = target_list.find('li').length;
		more_count[more_type] += num;
		target_list.find(`li:lt(${more_count[more_type]})`).fadeIn();
		if( more_count[more_type] >= max_count ){
			$(el).hide();
		}
	}

	//オブジェクトをhtmlに変換する
	//返り値：html
	function createDom(items, delate_btn_flg = null){
		let html_template = '';
		let delate_dom = '';
		if(delate_btn_flg){
			delate_dom = '<div class="cart-delete"><img src="img/icon_delete.svg"></div>';
		}
		items.forEach(function(item, index){
			html_template += `<li class="item" data-item-id="${item['id']}">
			    <a href="detail.html?id=${item['id']}">
			      <div class="item-cap"><img src="./img/item/${item['id']}.png" loading="lazy"></div>
			      <div class="item-info">
			        <h3 class="item-name">${item['name']}</h3>
			        <p class="item-text">${item['text']}</p>
			        <div class="item-price">¥${item['price']}</div>
			      </div>
			    </a>
			    ${delate_dom}
			  </li>`;
		});
		return html_template;
	}

	function searchWordShow() {
		let result_text;
		if( param_key == 'price' ){
			result_text = `〜${param_value}円`;
			$(`.price-select option[value="${param_value}"]`).prop('selected', true);
		}else{
			result_text = param_value;
		}
		$('.result-text').text(decodeURI(result_text));
	}

	function getItemSingle() {
		return item_data.find(function(item){
			return item['id'] == param_value;
		});
	}

	function getItemList(key, value = null){
		const search_value = value ? value : param_value;
		const freewords = ['name', 'text'];
		const items = item_data.filter(function(item, index) {
			switch(key){
				case 'brand':
				case 'category':
					return item[key] == search_value
					break;
				case 'freeword':
					return freewords.find(function(freeword){
						return item[freeword].indexOf(decodeURI(param_value)) !== -1
					});
					break;
				case 'price':
					return item['price'] <= search_value
					break;
				case 'new':
					return item['new']
					break;
			}
		});
		searchWordShow()
		return items;
	}

	function pickUpShuffle(item_data) {
		let items = [];
		let rand_check = [];
		for( let i = 0; i < 6; i++ ){
			let j = Math.floor(Math.random() * item_data.length);
			if( rand_check.indexOf(j) !== -1 ){
				i--;
				continue;
			}else{
				rand_check.push(j);
				items.push(item_data[j]);
			}
		}
		return items;
	}

	function doneFlash(text) {
		$('body').append(`<div class="flash">${text}</div>`);
		setTimeout(function(){
			location.reload();
		}, 2000);
	}

	function storageControl(id, storage_type) {
		let storage_data = JSON.parse(localStorage.getItem(`ninco_${storage_type}`));
		id = Number(id);
		if( storage_data == null ){
			storage_data = [id];
		}else{
			if( storage_data.indexOf(id) !== -1 ){
				storage_data.splice(storage_data.indexOf(id), 1);
			}else{
				storage_data.push(id);
			}
		}
		localStorage.setItem(`ninco_${storage_type}`, JSON.stringify(storage_data));
	}

	function storageSaveJudge(id, storage_type) {
		let storage_data = JSON.parse(localStorage.getItem(`ninco_${storage_type}`));
		id = Number(id);
		if( storage_data !== null ){
			return storage_data.indexOf(id) !== -1;
		}
	}
	
	
	//TOPのスライダー
	$('.top-slider').slick({
		arrows:true,
		autoplay:true,
		dots:true,
		speed:1500,
		easing:'swing',
		centerMode:true,
		centerPadding:'25%',
		prevArrow:'<div class="slide-btn prev-btn"></div>',
		nextArrow:'<div class="slide-btn next-btn"></div>',
		responsive:[
			{
				breakpoint:768,
				settings:{
					centerPadding:'0%',
					slidesToShow:1,
					slidesToScroll:1,
				}
			}
		]
	});

	// ハンバーガーメニュー
	$('.menu-trigger').on('click', function() {
		$(this).toggleClass('is-active');
		$('.header-links').toggleClass('is-active');
	});

	// サイズの選択
	$('.item-size-list li').on('click', function() {
		const select_size = $(this).text();
		$(this).addClass('is-active');
		$(this).siblings('li').removeClass('is-active');
		$('.item-size-select span').text(select_size);
	});

	// レビュー
	let review_num = 0;
	$('.review li').on('click', function() {
		if( review_num == $('.review li').index(this) + 1 ){
			$('.review li').removeClass('is-active');
			review_num = 0;
		}else{
			review_num = $('.review li').index(this) + 1;
			$('.review li').removeClass('is-active');
			$(`.review li:lt('${review_num}')`).addClass('is-active');
		}
	});

	//アイテム詳細説明文アコーディオン
	$('[data-accordion="trigger"]').on('click', function() {
		$(this).toggleClass('is-active');
		$(this).next().slideToggle();
	});

	//スマホ時のサイドバー開閉
	$('.sidebar-title').on('click',function(){
		$(this).toggleClass('is-active');
	  $(this).next('.sidebar-body').stop().toggle();
	});


	let item_list_pickup = createDom(pickUpShuffle(item_data));
	$('[data-item-list="pickup"]').append(item_list_pickup);

	$('[data-more-btn="brand"]').on('click',function(){
	  moreControl($(this), 3);
	});

	$('[data-more-btn="items"]').on('click',function(){
	  moreControl($(this), 10);
	});

	$('.word-search').focus(function(){
		$(this).addClass('is-cursor');
	}).blur(function(){
		$(this).removeClass('is-cursor');
	});

	$('.controls-cart').on('click', function(e){
		e.preventDefault();
		$('.modal-wrap').fadeToggle();
		$('.menu-trigger, .header-links').removeClass('is-active');
	});

	$('.modal-close, .modal-wrap').on('click', function(e){
		$('.modal-wrap').fadeOut();
	});

	//カートからアイテムを削除
	$('body').on('click', '.cart-delete', function(){
		if( confirm('本当に削除して良いですか?') ){
			const item_id = $(this).parents('[data-item-id]').attr('data-item-id');
			storageControl(item_id, 'cart');
			setTimeout(function(){
				location.reload();
			}, 200);
		}
	});

	//購入ボタンを押したときの処理
	$('.btn--buy').on('click', function(){
		if( confirm('購入して良いですか?') ){
			localStorage.removeItem('ninco_cart');
			alert('購入しました！');
		}
	});


	
	//カートに追加
	$('.btn--cart').on('click', function(){
		const item_id = $(this).parents('.item-detail').attr('data-item-id');
		storageControl(item_id, 'cart');

		if( storageSaveJudge(item_id, 'cart') ){
			doneFlash('カートに追加しました。');
		}else{
			doneFlash('カートから外しました。');
		}

	});

	//カートに入れたアイテムを生成
	const cart_storage = JSON.parse(localStorage.getItem('ninco_cart'));
	if( cart_storage !== null ){
		let cart_price = 0;
		const cart_items = item_data.filter(function(item) {
			if( cart_storage.indexOf(item['id']) !== -1 ){
				cart_price += item['price'];
				return item;
			}
		});

		//カートの合計金額を出力
		$('.cart-total-price').text(cart_price + '円');

		//カートの合計点数を計算
		$('.cart-batch, .cart-total-num').text(cart_storage.length);

		if( cart_storage.length <= 0 ){
			$('.cart-batch').hide();
		}

		$('#cart-list').append(createDom(cart_items, true));
	}else{
		$('.cart-batch').hide();
	}

	//お気に入りに追加
	$('.btn--fav').on('click', function(){
		const item_id = $(this).parents('.item-detail').attr('data-item-id');
		storageControl(item_id, 'fav');

		if( storageSaveJudge(item_id, 'fav') ){
			doneFlash('お気に入りに追加しました。');
		}else{
			doneFlash('お気に入りから外しました。');
		}

	});


	const fav_storage = JSON.parse(localStorage.getItem('ninco_fav'));
	if( fav_storage !== null ){
		const fav_items = item_data.filter(function(item) {
			if( fav_storage.indexOf(item['id']) !== -1 ){
				return item;
			}
		});
		$('[data-item-list="fav"]').append(createDom(fav_items));

		//お気に入りのスライダー
		$('[data-item-list="fav"]').slick({
			arrows:true,
			autoplay:true,
			dots:false,
			speed:1500,
			easing:'swing',
			slidesToShow:5,
			slidesToScroll:1,
			prevArrow:'<div class="slide-btn prev-btn"></div>',
			nextArrow:'<div class="slide-btn next-btn"></div>',
			responsive:[
				{
					breakpoint:768,
					settings:{
						centerPadding:'0%',
						slidesToShow:3,
						slidesToScroll:1,
					}
				}
			]
		});

	}





	if( page_type == 'page-index' ){
		let item_list_new = getItemList('new');
		$('[data-item-list="new"]').append(createDom(item_list_new));
		categorys.forEach(function(category){
			let item_list_category = getItemList('category', category);
			item_list_category = createDom(item_list_category);
			$(`[data-item-list="${category}"]`).append(item_list_category);
		})
	}

	if( page_type == 'page-detail' ){
		const item_detail = getItemSingle();
		const storage_types = ['cart', 'fav'];
		Object.keys(item_detail).forEach(function(key){
			$(`[data-item-parts="${key}"]`).text(item_detail[key]);
		});
		$('#zoom-img').attr('src', `./img/item/${item_detail['id']}.png`);
		$('#zoom-img').attr('data-zoom-image', `./img/item/${item_detail['id']}_l.png`);
		$('.item-detail').attr('data-item-id', item_detail['id']);
		if( !item_detail['new'] ){
			$('.new-label').remove();
		}

		storage_types.forEach(function(type){
			if( storageSaveJudge(item_detail['id'], type) ){
				$(`.btn--${type}`).addClass('is-storage');
			}
		});
		
		$('[data-zoom-image]').elevateZoom();
	}

	if( page_type == 'page-list' ){
		const item_list = createDom(getItemList(param_key));
		$('.sort-list').append(item_list);
		$('.price-select').on('change', function(){
			$('#price-form').submit();
		});
	}








});

$(window).on("scroll", function() {

	//ころりん
	if( $(window).scrollTop() > 300 ){
		$('.circle-banner').addClass('is-over');
	}else{
		$('.circle-banner').removeClass('is-over');
	}
	if( $(window).scrollTop() > $('.footer').offset().top - 1000 ){
		$('.circle-banner').removeClass('is-over');
	}

	//フェイドイン
	$('[data-fadeIn]').each(function(index, el) {
		if( $(window).scrollTop() > ( $(el).offset().top - $(window).height() / 2 ) ){
			$(el).addClass('is-over');
		}
	});

});

$(window).on("load", function() {

	// ローディング
	setTimeout(function() {
		$('.loader').fadeOut();
	},600)

});
