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
  let map;

  // Создание экземпляра карты.
  function createMap() {
    map = new ymaps.Map(
      'map',
      {
        center: [55.753215, 37.622504],
        zoom: 10,
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
      features: shops.map(({ id, coords, vendor }) => ({
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

    map.geoObjects.events.add('click', (event) => {
      const id = event.get('objectId');
      if (typeof id !== 'undefined') {
        const content = $('<div>')
          .addClass('Map-Modal-Card-Content')
          .append(getCardContent(shops.find((el) => el.id === id)));

        const close = $('<span>')
          .addClass('close-btn')
          .bind('click', function () {
            $('.Map-Modal-Card').css('display', 'none');
          });
        $('.Map-Modal-Card').empty().append(content, close);
        $('.Map-Modal-Card').css('display', 'block');
      }
    });
    // $.ajax({
    //     url: "data.json"
    // }).done(function(data) {
    //     objectManager.add(data);
    // });

    //create menu
    $(function () {
      shops.forEach((shop) => {
        const menuItem = getCardContent(shop);

        menuItem.bind('mouseover', function () {
          objectManager.objects.setObjectOptions(shop.id, { ...hoverPreset });
        });
        menuItem.bind('mouseout', function () {
          objectManager.objects.setObjectOptions(shop.id, { ...defaultPreset });
        });
        menuItem.appendTo($('.Menu'));
      });
    });

    function getCardContent(shop) {
      const img = $('<img>').attr('src', `assets/img/${getSlug(shop.vendor)}.png`);
      const image = $('<div>').addClass('Menu-Item-Image').append(img);
      const vendor = $('<h4>' + shop.vendor + '</h4>');
      const address = $('<p>' + shop.address + '</p>');
      const info = $('<div>').addClass('Menu-Item-Info').append(vendor, address);
      const menuItem = $('<div>').addClass('Menu-Item').append(image, info);
      return menuItem;
    }

    $('.Map-Modal').css('display', 'block');

    // Выставляем масштаб карты чтобы были видны все группы.
    // map.setBounds(map.geoObjects.getBounds());
  }

  $('#toggle').bind('click', createMap);

  $('#back').bind('click', function () {
    map.destroy();
    map = null;
    $('.Map-Modal').css('display', 'none');
  });
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
