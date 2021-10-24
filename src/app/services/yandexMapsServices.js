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
  isCorrectAddress;
  setIsCorrectAddress;
  shortAddress;
  suggestView;
  setAddress;
  setCoordinates;
  setInputHelp;
  setErrorsSuggest;
  clearForm;
  getDrivers;

  constructor({ ...rest }) {
    const { ymaps } = window;
    this.ymaps = ymaps;
    const {
      setAddress,
      setCoordinates,
      setInputHelp,
      setErrorsSuggest,
      clearForm,
      setIsCorrectAddress,
      getDrivers
    } = rest;
    this.setAddress = setAddress;
    this.setCoordinates = setCoordinates;
    this.setInputHelp = setInputHelp;
    this.setErrorsSuggest = setErrorsSuggest;
    this.clearForm = clearForm;
    this.setIsCorrectAddress = setIsCorrectAddress;
    this.getDrivers = getDrivers;
  }

  init() {
    this.map = new this.ymaps.Map(
      "map",
      {
        center: [56.86186, 53.23243],
        zoom: 12,
        controls: ["zoomControl", "fullscreenControl"],
      },
      { searchControlProvider: "yandex#search" }
    );

    this.addMapEvent();
  }

  getRoutes(setRoutesLengtsState, crews, clientCoords) {
    const lengthsArr = [];
    crews.forEach((crew) => {
      const crewCoords = [crew.lat, crew.lon];
      lengthsArr.push(
        this.ymaps
          .route([crewCoords, clientCoords])
          .then((route) => route.getLength())
      );
    });

    Promise.all(lengthsArr).then((res) => {
      const routeLengthArr = res.map((lengt, index) => ({
        id: crews[index].crew_id,
        length: lengt,
      }));

      setRoutesLengtsState(routeLengthArr);
    });
  }

  renderPlacemarks(objEntities) {
    objEntities.forEach((entity) => {
      const coord = [entity.lat, entity.lon];
      const myPlacemark = new ymaps.Placemark(
        coord,
        {
          iconCaption: `${entity.car_mark} ${entity.car_model}`,
          balloonContentHeader: `Машина: ${entity.car_mark} ${entity.car_model}`,
          balloonContentBody: `Номер: ${entity.car_number}`,
          hintContent: `${entity.car_mark} ${entity.car_model}`,
        },
        {
          preset: "islands#blueDotIcon",
          iconColor: "#28a745",
        }
      );

      this.map.geoObjects.add(myPlacemark);
    });
  }

  addMapEvent() {
    this.map.events.add("click", async (e) => {
      const coords = e.get("coords");
      await this.getCoordinatesAndObject(coords);
      await this.createMapClick();
      this.moveMapSlow();
      this.clearForm();
      if (this.isCorrectAddress) {
        this.getDrivers();
      };
    });
  }

  moveMapFast() {
    const mapContainer = document.getElementById("map");
    const bounds = this.obj.properties.get("boundedBy");
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
    this.checkCorrectAddress();
  }

  async createPlacemark(clickedAddress) {
    await this.getCoordinatesAndObject(clickedAddress);
    this.createMapClick();
    this.moveMapFast();
    if (this.isCorrectAddress) {
      this.getDrivers();
    };
  }

  clearMap() {
    this.map.geoObjects.removeAll();
  }

  createMapClick() {
    this.map.geoObjects.removeAll();
    this.placemark = new this.ymaps.Placemark(
      this.coords,
      { iconCaption: this.isCorrectAddress ? "" : "Адрес не найден" },
      {
        preset: this.isCorrectAddress
          ? "islands#yellowDotIconWithCaption"
          : "islands#redDotIconWithCaption",
      }
    );

    this.map.geoObjects.add(this.placemark);
    this.placemark.events.add("dragend", async () => {
      const coords = this.placemark.geometry.getCoordinates();
      await this.getCoordinatesAndObject(coords);
      this.moveMapSlow();
      this.setFormAddressAndCoordinates();
    });

    this.setFormAddressAndCoordinates();

  }

  setFormAddressAndCoordinates() {
    const street = this.obj.getThoroughfare();
    const homeNum = this.obj.getPremiseNumber();

    if (street && homeNum) {
      this.placemark.properties.set({
        iconCaption: `${street}, ${homeNum}`,
        balloonContent: `${street}, ${homeNum}`,
      });

      this.setAddress(`${street}, ${homeNum}`);
      this.setCoordinates(this.coords);
      return;
    }

    if (street) {
      this.placemark.properties.set({
        iconCaption: "Адрес не найден",
        balloonContent: street,
      });

      this.setAddress(street);
      return;
    }
  }

  getAddressSuggest(val) {
    this.ymaps.suggest(`Ижевск ${val}`, { results: 5 }).then((items) => {
      const help = items.map((item) => item.value);
      if (help.length > 0) {
        this.setInputHelp(help);
        return;
      }
    });
  }

  getIsCorrectAddress() {
    return this.isCorrectAddress;
  }

  checkCorrectAddress() {
    this.isCorrectAddress = false;

    if (this.obj) {
      switch (
      this.obj.properties.get("metaDataProperty.GeocoderMetaData.precision")
      ) {
        case "exact":
          this.isCorrectAddress = true;
          this.setErrorsSuggest("Адрес найден");
          break;
        case "number":
        case "near":
        case "range":
          this.isCorrectAddress = false;
          this.setErrorsSuggest("Уточните номер дома");
          break;
        case "street":
          this.isCorrectAddress = false;
          this.setErrorsSuggest("Уточните номер дома");
          break;
        case "other":
        default:
          this.isCorrectAddress = false;
          this.setErrorsSuggest("Уточните адрес");
      }
    } else {
      this.isCorrectAddress = false;
      this.setErrorsSuggest("Адрес не найден");
    };

    this.setIsCorrectAddress(this.isCorrectAddress);
  };
}
