import React, { useCallback, useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Field, Formik, FormikProps } from 'formik';
import { Button, Form } from 'react-bootstrap';
import * as Yup from "yup";
import moment from 'moment';

import YandexMaps from './../../services/yandexMapsServices';
import { IGetCrewsQuery, IRouteLength, IState, MyFormValues, ISimpleCrew, ICreateOrderQuery } from './types';
import * as actions from './redux/orderFormActions';
import { CardSpinner } from '../cardSpinner/CardSpinner';
import { OrderFormModal } from './OrderFormModal';

let yandexMaps: YandexMaps;

const Schema = Yup.object().shape({
  address: Yup.string().required('Поле обязательно для заполнения'),
});

const initialValues: MyFormValues = { address: '' };

export const OrderForm: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState<number[]>([]);
  const [address, setAddress] = useState<string>('');
  const [showInputHelp, setShowInputHelp] = useState<boolean>(false);
  const [inputHelp, setInputHelp] = useState<string[]>([]);
  const [routesLengts, setRoutesLengts] = useState<IRouteLength[]>([]);
  const [crewsList, setCrewsList] = useState<ISimpleCrew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<ISimpleCrew | null>(null);
  const [errorsSuggest, setErrorsSuggest] = useState<string>('');
  const [isCorrectAddress, setIsCorrectAddress] = useState<boolean>(false);

  const formikRef = useRef<FormikProps<MyFormValues>>(null);
  const dispatch = useDispatch();

  const { currentState } = useSelector((state: IState) => ({ currentState: state.taxi }), shallowEqual);
  const { crewsLoading, orderLoading, entities, orderId } = currentState;

  const clearAll = useCallback(() => {
    yandexMaps.clearMap();
    setAddress('');
    setCoordinates([]);
    setErrorsSuggest('');
    setIsCorrectAddress(false);
    formikRef.current?.resetForm();
    dispatch(actions.clearState());
    setCrewsList([]);
    setSelectedCrew(null);

  }, [dispatch]);

  const getDrivers = useCallback(() => {
    const queryParams: IGetCrewsQuery = {
      source_time: moment().format('YYYYMMDDhhmmss'),
      addresses: [{
        address: address,
        lat: coordinates[0],
        lon: coordinates[1],
      }],
    };

    dispatch(actions.fetchCrews(queryParams));
  }, [address, coordinates, dispatch]);

  useEffect(() => {
    yandexMaps = new YandexMaps({ setAddress, setCoordinates, setInputHelp, setErrorsSuggest, clearForm, setIsCorrectAddress, getDrivers });
    yandexMaps.ymaps.ready(() => {
      yandexMaps.init();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (orderId) {
      setShowModal(true);
    }
  }, [orderId]);

  useEffect(() => {
    if (address.length < 3 || inputHelp.length === 0)
      setShowInputHelp(false);
  }, [address.length, inputHelp.length])

  useEffect(() => {
    formikRef.current?.setFieldValue('address', address);
  }, [address]);

  useEffect(() => {
    if (entities.length) {
      yandexMaps.renderPlacemarks(entities);
      yandexMaps.getRoutes(setRoutesLengts, entities, coordinates);
    };
  }, [crewsLoading, coordinates, entities]);

  useEffect(() => {
    if (routesLengts.length && entities.length) {
      const list = entities.map(crew => {
        const route = routesLengts.find(route => route.id === crew.crew_id);
        return {
          id: crew.crew_id,
          car_mark: crew.car_mark,
          car_model: crew.car_model,
          car_color: crew.car_color,
          car_number: crew.car_number,
          distance: route?.length
        }
      });

      //@ts-ignore
      const sortedList = list.sort((a, b) => a.distance - b.distance);
      setCrewsList(sortedList);
      setSelectedCrew(sortedList[0]);
    };

  }, [routesLengts, entities]);

  const searchAddressYmaps = useCallback((val) => {
    yandexMaps.getAddressSuggest(val);
  }, []);

  const handleAddressChange = useCallback((e) => {
    formikRef.current?.setFieldValue('address', e.target.value);
    setAddress(e.target.value);
    if (e.target.value.length > 2) {
      searchAddressYmaps(e.target.value);
      setShowInputHelp(true);
    };

    setErrorsSuggest('');
  }, [searchAddressYmaps]);

  const clearForm = useCallback(() => {
    dispatch(actions.removeCrews());
    setCrewsList([]);
    setSelectedCrew(null);
  }, [dispatch]);

  const handleInputHelpClick = useCallback((e) => {
    clearForm();
    setShowInputHelp(false);
    yandexMaps.createPlacemark(e.target.value);
  }, [clearForm]);

  const createOrder = useCallback(() => {
    if (selectedCrew) {
      const queryParams: ICreateOrderQuery = {
        source_time: moment().format('YYYYMMDDhhmmss'),
        addresses: [{
          address: address,
          lat: Number(coordinates[0]),
          lon: Number(coordinates[1]),
        }],
        crew_id: selectedCrew.id,
      };

      dispatch(actions.createOrder(queryParams));
    };
  }, [address, coordinates, selectedCrew, dispatch]);

  const handleSelectCar = useCallback(({ id }) => {
    const selectedCrew = crewsList.find(crew => crew.id === id);
    selectedCrew && setSelectedCrew(selectedCrew);
  }, [crewsList]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    clearAll();
  }, [clearAll]);

  return (
    <>
      {(crewsLoading || orderLoading) && <CardSpinner />}
      {selectedCrew && (
        <OrderFormModal showModal={showModal} closeModal={closeModal}>
          <>
            <p>К вам едет:</p>
            <div className="d-flex">
              <div>
                <h5>{`${selectedCrew.car_mark} ${selectedCrew.car_model}`}</h5>
                <p>{selectedCrew.car_color}</p>
              </div>
              <div className="ml-3">
                {selectedCrew.car_number}
              </div>
            </div>
          </>
        </OrderFormModal>
      )}
      <Formik
        //@ts-ignore
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={Schema}
        validateOnChange={true}
        onSubmit={() => createOrder()}
      >
        {({ errors, touched, isValid, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label className="mr-3">Откуда:</label>
                  <Field
                    name="address"
                    className={`form-control form-control-lg form-control-solid ${touched.address && errors.address && "is-invalid"}`}
                    placeholder="Адрес объекта"
                    value={address}
                    onChange={handleAddressChange}
                    autoComplete="off"
                  />
                  <select
                    className={`custom-select ${showInputHelp ? 'd-block' : 'd-none'}`}
                    size={inputHelp.length <= 1 ? inputHelp.length + 1 : inputHelp.length - 0}
                  >
                    {inputHelp.map((helpItem, index) => (
                      <option key={index} onClick={e => handleInputHelpClick(e)}>
                        {helpItem}
                      </option>
                    ))}
                  </select>
                  {(errors.address && touched.address) && <div className="invalid-feedback">{errors.address}</div>}
                  <div className="invalid-feedback d-block">{errorsSuggest}</div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-6">
                <div className="form-group d-flex">
                  <label className="mr-3">Подходящий экипаж:</label>
                  {crewsLoading ? 'Идет поиск машины...' : null}
                  {!crewsLoading && selectedCrew ? (
                    <div className="d-flex">
                      <div>
                        <h5>{`${selectedCrew.car_mark} ${selectedCrew.car_model}`}</h5>
                        <p>{selectedCrew.car_color}</p>
                      </div>
                      <div className="ml-3">
                        {selectedCrew.car_number}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-8">
                <div id="map" style={{ height: '550px' }}></div>
              </div>
              <div className="col-4">
                <ul className="carsList">
                  {crewsList && crewsList.map((crew) => {
                    return (
                      <li
                        key={crew.id} className={`car cursor-pointer ${crew.id === selectedCrew?.id ? 'active' : ''}`}
                        onClick={() => handleSelectCar({ id: crew.id })}
                      >
                        <div className="d-flex p-1">
                          <div>
                            <h5>{`${crew.car_mark} ${crew.car_model}`}</h5>
                            <p>{crew.car_color}</p>
                          </div>
                          <div className="ml-3">
                            {crew.distance ? `${Math.round(crew.distance)}м` : ''}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
            <div className="row justify-content-center mt-3">
              <Button
                type="submit"
                disabled={!isCorrectAddress || crewsLoading || (touched && !isValid)}
              >
                Заказать
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};