ymaps.ready(init);

function init() {

    // Создание экземпляра карты.
    const map = new ymaps.Map('map', {
            center: [55.753215, 37.622504],
            zoom: 10,
            controls: ['geolocationControl', 'zoomControl'],
        }, {
            maxZoom: 17,
        });

   const objectManager=  new ymaps.ObjectManager({
        clusterize: false,
    });

    const collection = {
        type: 'FeatureCollection',
        features: shops.map(({ id, coords,  vendor }) => ({
          type: 'Feature',
          id,
          geometry: {
            type: 'Point',
            coordinates: coords,
          },
          options: {"preset": "islands#blueIcon"},
        })),
      };
      objectManager.add(collection)
      map.geoObjects.add(objectManager)
    // $.ajax({
    //     url: "data.json"
    // }).done(function(data) {
    //     objectManager.add(data);
    // });


    //create menu
    $(function () {
        shops.forEach(shop=>{
            const img = $('<img>').attr("src", "#");
            const vendor = $('<h3>' + shop.vendor + '</h3>')
            const address = $('<p>' + shop.address + '</p>')
            const info = $('<div>').addClass("menu-item-info").append(vendor,address)
            const menuItem = $('<div>').addClass('menu-item').append(img,info)
            menuItem.bind('mouseover', function () {
                objectManager.objects.setObjectOptions(shop.id, {"preset": "islands#redIcon"})
            });
            menuItem.bind('mouseout', function () {
                objectManager.objects.setObjectOptions(shop.id, {"preset": "islands#blueIcon"})
            });
            menuItem.appendTo($('.menu'));
        })
    })

   
    // Выставляем масштаб карты чтобы были видны все группы.
    // map.setBounds(map.geoObjects.getBounds());
}