/* eslint-disable indent */
/* eslint-disable no-undef */
export default class YandexMaps {
  map;
  placemark;
  ymaps;
  coords;
  mapState;
  obj;
  address;
  shortAddress;
  suggestView;
  setAddress = undefined;
  setCoordinates = undefined;

  constructor({ ymaps, ...rest }) {
    this.ymaps = ymaps;

    const { setAddress, setCoordinates } = rest;

    this.setAddress = setAddress;
    this.setCoordinates = setCoordinates;
  }

  init() {
    this.map = new this.ymaps.Map(
      'map',
      { center: [56.86186, 53.23243], zoom: 11, controls: ['zoomControl', 'fullscreenControl'] },
      { searchControlProvider: 'yandex#search' },
    );

    this.addMapEvent();
  }

  async renderOneObject(entity) {
    const coord = entity.coords.split(',').map(item => Number(item));
    await this.getCoordinatesAndObject(coord);
    const placemark = new this.ymaps.Placemark(
      coord,
      { iconCaption: entity.name },
      {
        preset: 'islands#violetDotIconWithCaption',
        draggable: false,
      },
    );
    this.map.geoObjects.add(placemark);
    this.moveMapFast();
  }

  renderAllObjects(objEntities) {
    const objManager = new ymaps.ObjectManager({
      clusterize: true,
      gridSize: 32,
      clusterDisableClickZoom: true,
    });

    objManager.objects.options.set('preset', 'islands#blueDotIcon');
    objManager.clusters.options.set('preset', 'islands#blueClusterIcons');
    this.map.geoObjects.add(objManager);

    const pickups = {
      type: 'FeatureCollection',
      features: [],
    };

    objEntities.forEach((entity, index) => {
      const coord = entity.coords.split(',').map(item => Number(item));

      pickups.features.push({
        type: 'Feature',
        id: index,
        geometry: { type: 'Point', coordinates: coord },
        properties: {
          balloonContentHeader: `Название: ${entity.name}`,
          balloonContentBody: `Адрес: ${entity.address}`,
          clusterCaption: entity.name,
          hintContent: entity.name,
        },
      });
    });

    objManager.add(pickups);
    this.map.setBounds(this.map.geoObjects.getBounds());
  }

  addMapEvent() {
    this.map.events.add('click', async e => {
      const coords = e.get('coords');
      await this.getCoordinatesAndObject(coords);
      await this.createMapClick();
      this.moveMapSlow();
    });
  }

  moveMapFast() {
    const mapContainer = document.getElementById('map');
    const bounds = this.obj.properties.get('boundedBy');
    this.mapState = this.ymaps.util.bounds.getCenterAndZoom(bounds, [
      mapContainer.offsetWidth,
      mapContainer.offsetHeight,
    ]);

    this.map.setCenter(this.mapState.center, this.mapState.zoom);
  }

  moveMapSlow() {
    this.map.panTo(this.coords, { flying: 5 });
  }

  async getCoordinatesAndObject(point) {
    const res = await this.ymaps.geocode(point);
    this.obj = await res.geoObjects.get(0);
    this.coords = this.obj.geometry.getCoordinates();
  }

  async createPlacemark(clickedAddress) {
    await this.getCoordinatesAndObject(clickedAddress);
    this.createMapClick();
    this.moveMapFast();
  }

  async createMapClick() {
    if (this.placemark) {
      this.placemark.geometry.setCoordinates(this.coords);
    } else {
      this.placemark = new this.ymaps.Placemark(
        this.coords,
        { iconCaption: 'поиск...' },
        {
          preset: 'islands#violetDotIconWithCaption',
          draggable: true,
        },
      );

      this.map.geoObjects.add(this.placemark);
      this.placemark.events.add('dragend', async () => {
        const coords = this.placemark.geometry.getCoordinates();
        await this.getCoordinatesAndObject(coords);
        this.moveMapSlow();
        this.setFormAddressAndCoordinates();
      });
    }

    this.setFormAddressAndCoordinates();
  }

  setFormAddressAndCoordinates() {
    this.placemark.properties.set('iconCaption', 'поиск...');
    this.placemark.properties.set({
      iconCaption: this.obj.getThoroughfare()
        ? [this.obj.getThoroughfare(), this.obj.getPremiseNumber()].join(' ')
        : this.obj.getLocalities(),
      balloonContent: this.obj.getAddressLine(),
    });

    this.setCoordinates(this.coords.join(', '));
    this.setAddress(this.obj.getAddressLine());
  }

  /* checkCorrectAddress() {
    let msg = '';

    if (this.obj) {
      // Об оценке точности ответа геокодера можно прочитать тут: https://tech.yandex.ru/maps/doc/geocoder/desc/reference/precision-docpage/
      switch (this.obj.properties.get('metaDataProperty.GeocoderMetaData.precision')) {
        case 'exact':
          msg = 'Адрес найден';
          break;
        case 'number':
        case 'near':
        case 'range':
          msg = 'Уточните номер дома';
          break;
        case 'street':
          msg = 'Уточните номер дома';
          break;
        case 'other':
        default:
          msg = 'Уточните адрес';
      }
    } else {
      msg = 'Адрес не найден';
    }

    console.log(msg);
  } */
}
