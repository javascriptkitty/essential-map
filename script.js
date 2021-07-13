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
    fetch('https://sheetdb.io/api/v1/fxwqiedl4xd7p')
      .then((response) => response.json())
      .then((res) => {
        const formatted = res.sort((a, b) =>
          a.address
            .replace(new RegExp('^([^ ]+ )'), '')
            .trim()
            .localeCompare(b.address.replace(new RegExp('^([^ ]+ )'), '').trim())
        );
        const data = formatted.map((el) => ({
          id: el.id,
          address: el.address,
          vendor: el.vendor,
          coords: [parseFloat(el.latitude), parseFloat(el.longitude)],
        }));
        createMap(data);
      });
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
