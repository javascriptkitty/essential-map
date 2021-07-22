ymaps.ready(init);

const defaultPreset = {
  iconImageSize: [34, 45],
  iconImageOffset: [-17, -45],
  zIndex: 1000,
};
const hoverPreset = {
  iconImageSize: [44, 58],
  iconImageOffset: [-22, -58],
  zIndex: 1100,
};

function init() {
  $('#toggle').bind('click', function () {
    const data = shops.map(({ id, latitude, longitude, address, vendor }) => ({
      coords: [latitude, longitude],
      id,
      address,
      vendor,
    }));
    createMap(data);
  });
}

function createMap(data) {
  map = new ymaps.Map(
    'map',
    {
      center: [55.762937, 37.435451],
      zoom: 9,
      controls: ['zoomControl'],
    },
    {
      maxZoom: 17,
    }
  );

  const objectManager = new ymaps.ObjectManager({
    clusterize: false,
  });

  const collection = {
    type: 'FeatureCollection',
    features: data.map(({ id, coords, vendor }) => ({
      type: 'Feature',
      id,
      geometry: {
        type: 'Point',
        coordinates: coords,
      },
      options: {
        ...defaultPreset,
        iconLayout: 'default#image',
        iconImageHref: `assets/img/placemark-${getSlug(vendor)}.png`,
      },
    })),
  };
  objectManager.add(collection);
  map.geoObjects.add(objectManager);

  map.events.add('boundschange', (event) => {
    let shopsVisible = data.filter(({ coords }) => {
      const x = coords[0];
      const y = coords[1];
      const [top, bottom] = event.originalEvent.newBounds;
      return x > top[0] && x < bottom[0] && y > top[1] && y < bottom[1];
    });
    $('.Menu-List').empty();
    $('.Menu-Expansion').empty();
    createMenu(shopsVisible, objectManager);
  });

  map.geoObjects.events.add('click', (event) => {
    const id = event.get('objectId');
    const coords = objectManager.objects.getById(id).geometry.coordinates;
    map.setCenter(coords, 14, {
      duration: 500,
      timingFunction: 'ease',
    });
    createCard(
      id,
      data.find((el) => el.id === id),
      objectManager
    );

    map.geoObjects.events.add('click', (event) => {
      if (event.get('objectId') !== id) {
        objectManager.objects.setObjectOptions(id, { ...defaultPreset });
      }
    });
  });

  // $('#map').bind('toggle', function (event, ui) {
  //   map.container.fitToViewport();
  //   map.setBounds(myMap.geoObjects.getBounds(), {
  //     duration: 500,
  //     timingFunction: 'ease',
  //   });
  // });

  createMenu(data, objectManager);

  $('.Map-Modal').css('display', 'block');

  $('#back').bind('click', function () {
    map.destroy();
    map = null;
    $('.Menu-List').empty();
    $('.Menu-Expansion').empty();
    $('.Map-Modal-Card').css('display', 'none');
    $('.Map-Modal').css('display', 'none');
  });
}

function createMenu(shops, objectManager) {
  shops.forEach((shop) => {
    const menuItem = getCardContent(shop);

    menuItem.bind('mouseover', function () {
      objectManager.objects.setObjectOptions(shop.id, { ...hoverPreset });
    });
    menuItem.bind('mouseout', function () {
      objectManager.objects.setObjectOptions(shop.id, { ...defaultPreset });
    });
    menuItem.appendTo($('.Menu-List'));
  });
  $('.Menu-Expansion').append(
    ` <p>Смотреть в списке <b>${shops.length} оффлайн-${pluralizeShop(shops.length)}</b></p>`
  );
  if (window.innerWidth < 560) {
    $('.Menu-Item').bind('click', function (event) {
      const id = event.currentTarget.id.replace('item-', '');
      createCard(
        id,
        shops.find((el) => el.id === id),
        objectManager
      );
      $('.Menu').removeClass('Expanded');
    });
  }
}

function getCardContent(shop) {
  const img = $('<img>').attr('src', `assets/img/${getSlug(shop.vendor)}.png`);
  const image = $('<div>').addClass('Menu-Item-Image').append(img);
  const vendor = $('<h4>' + shop.vendor + '</h4>');
  const address = $('<p>' + shop.address + '</p>');
  const info = $('<div>').addClass('Menu-Item-Info').append(vendor, address);
  const menuItem = $('<div>').addClass('Menu-Item').attr('id', `item-${shop.id}`).append(image, info);
  return menuItem;
}

function createCard(id, data, objectManager) {
  const content = $('<div>').addClass('Map-Modal-Card-Content').append(getCardContent(data));

  const close = $('<span>')
    .addClass('close-btn')
    .bind('click', function () {
      $('.Map-Modal-Card').css('display', 'none');
      objectManager.objects.setObjectOptions(id, { ...defaultPreset });
    });
  $('.Map-Modal-Card').empty().append(content, close);
  $('.Map-Modal-Card').css('display', 'block');
  objectManager.objects.setObjectOptions(id, { ...hoverPreset });
}

function getSlug(vendor) {
  let slug;
  switch (vendor) {
    case 'Аптека Медси':
      slug = 'medsi';
      break;
    case 'Аптека AVE':
      slug = 'ave';
      break;
    case 'Пространство FACE ONLY':
      slug = 'face-only';
      break;
    case 'Магазин здоровых продуктов АМБАР':
      slug = 'ambar';
      break;
  }
  return slug;
}

const pluralizeShop = (num) => {
  const options = ['магазин', 'магазина', 'магазинов'];
  return pluralize(num, options);
};

const pluralize = (count, words) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return count === undefined ? count : words[count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]];
};

var shops = [
  {
    latitude: 55.7723843,
    longitude: 37.580642,
    address: '123056, Москва, Грузинский пер., 3А',
    vendor: 'Аптека Медси',
    id: '1',
  },
  {
    latitude: 55.7356972,
    longitude: 37.580235,
    address: '119435  Москва, Большая Пироговская ул., 7',
    vendor: 'Аптека Медси',
    id: '2',
  },
  {
    latitude: 55.7622312,
    longitude: 37.571772,
    address: '123242, Москва, ул. Красная Пресня, 16, 1 этаж',
    vendor: 'Аптека Медси',
    id: '3',
  },
  {
    latitude: 55.780854,
    longitude: 37.555526,
    address: '125284, Москва, 2-й Боткинский пр-д, 5 строение 3, 1 этаж',
    vendor: 'Аптека Медси',
    id: '4',
  },
  {
    latitude: 55.7543145,
    longitude: 37.637673,
    address: '109240, Москва, ул. Солянка, 1/2, корп. 1',
    vendor: 'Аптека Медси',
    id: '5',
  },
  {
    latitude: 55.766275,
    longitude: 37.596303,
    address: '123001, Москва, Благовещенский пер., 2/16 строение 1',
    vendor: 'Аптека Медси',
    id: '6',
  },
  {
    latitude: 55.7387188,
    longitude: 37.587025,
    address: '119034, Москва, Зубовский б-р, 22/39, 2 этаж',
    vendor: 'Аптека Медси',
    id: '7',
  },
  {
    latitude: 55.7173612,
    longitude: 37.592146,
    address: '119071 Москва, Ленинский пр-т., 20 корпус 1, 1 этаж',
    vendor: 'Аптека Медси',
    id: '8',
  },
  {
    latitude: 55.7101798,
    longitude: 37.655543,
    address: '115280  Москва, подиум А-165, ул. Ленинская Слобода, 26, 1 этаж',
    vendor: 'Аптека Медси',
    id: '9',
  },
  {
    latitude: 55.8334074,
    longitude: 37.291221,
    address: '143409, Московская область, ул. Успенская, 5, Красногорск',
    vendor: 'Аптека Медси',
    id: '10',
  },
  {
    latitude: 55.8707396,
    longitude: 37.335179,
    address: '143442  Московская область , Пятницкое ш., 6',
    vendor: 'Аптека Медси',
    id: '11',
  },
  {
    latitude: 55.772793,
    longitude: 37.540065,
    address: '123007  Москва, 3-й Хорошевский пр-д, 1 строение 2, 1 этаж',
    vendor: 'Аптека Медси',
    id: '12',
  },
  {
    latitude: 55.7385086,
    longitude: 37.270437,
    address: '143082  Московская область, Рублево-Успенское ш., 85/1, Барвиха',
    vendor: 'Аптека AVE',
    id: '13',
  },
  {
    latitude: 55.8122278,
    longitude: 37.042388,
    address: '143581  Московская область, ул. Невская 704 Павло-Слободское с/п, ул. Александра Невского, Борзые',
    vendor: 'Аптека AVE',
    id: '14',
  },
  {
    latitude: 55.8100783,
    longitude: 37.015596,
    address: '143582  Московская область, Центральная ул., 33, Покровское',
    vendor: 'Аптека AVE',
    id: '15',
  },
  {
    latitude: 55.757923,
    longitude: 37.615839,
    address: '103265, Москва, ул. Охотный Ряд, 1',
    vendor: 'Аптека AVE',
    id: '16',
  },
  {
    latitude: 55.7671876,
    longitude: 37.624173,
    address: '107045, Москва, Трубная пл., 2',
    vendor: 'Аптека AVE',
    id: '17',
  },
  {
    latitude: 55.7546025,
    longitude: 37.621599,
    address: '109012, Москва, Красная пл., 3',
    vendor: 'Аптека AVE',
    id: '18',
  },
  {
    latitude: 55.6458706,
    longitude: 37.485853,
    address: '117513, Москва, ул. Островитянова, 2',
    vendor: 'Аптека AVE',
    id: '19',
  },
  {
    latitude: 55.731695,
    longitude: 37.487466,
    address: '121108, Москва, Кутузовский просп., 48',
    vendor: 'Аптека AVE',
    id: '20',
  },
  {
    latitude: 55.7672284,
    longitude: 37.564367,
    address: '123022, Москва, ул. Пресненский Вал, 7 строение 1',
    vendor: 'Аптека AVE',
    id: '21',
  },
  {
    latitude: 55.7662144,
    longitude: 37.532424,
    address: '123290, Москва, 1-й Магистральный туп., 5а',
    vendor: 'Аптека AVE',
    id: '22',
  },
  {
    latitude: 55.7754,
    longitude: 37.4712,
    address: '123423, Москва, просп. Маршала Жукова, 39 корпус 1',
    vendor: 'Аптека AVE',
    id: '23',
  },
  {
    latitude: 55.76355,
    longitude: 37.596968,
    address: '123104 Москва, Большой Палашевский пер., 1/14',
    vendor: 'Пространство FACE ONLY',
    id: '24',
  },
  {
    latitude: 55.790633,
    longitude: 37.522881,
    address: '125252 Москва, Ходынский б-р, 20а',
    vendor: 'Пространство FACE ONLY',
    id: '25',
  },
  {
    latitude: 55.7043807,
    longitude: 37.512454,
    address: '119912 Москва, Мичуринский пр., 3',
    vendor: 'Пространство FACE ONLY',
    id: '26',
  },
  {
    latitude: 55.7710991,
    longitude: 37.619946,
    address: '127051 Москва, Цветной б-р, 15 строение 1, 4 этаж',
    vendor: 'Пространство FACE ONLY',
    id: '27',
  },
  {
    latitude: 55.736541,
    longitude: 37.246266,
    address: '143082 Московская область, 2 этаж, Жуковка',
    vendor: 'Пространство FACE ONLY',
    id: '28',
  },
  {
    latitude: 55.717498,
    longitude: 37.121722,
    address: '143030, Московская область, Одинцовский городской округ, деревня Бузаево, 100',
    vendor: 'Магазин здоровых продуктов АМБАР',
    id: '29',
  },
];
