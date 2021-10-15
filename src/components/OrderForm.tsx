import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Field, Formik, FormikProps, FormikConfig } from 'formik';
import { Button, Form } from 'react-bootstrap';
import * as Yup from "yup";

import YandexMaps from '../services/yandexMapsServices';
import './orderForm.scss';

let yandexMaps: YandexMaps;

const Schema = Yup.object().shape({
  address: Yup.string().required('Поле обязательно для заполнения'),
});

interface MyFormValues {
  address: string;
};

const initialValues: MyFormValues = { address: '' };

export const OrderForm: React.FC = () => {
  const [addressCoordinates, setAddressCoordinates] = useState('');
  const [formInput, setFormInput] = useState('');
  const [showInputHelp, setShowInputHelp] = useState(false);
  const [inputHelp, setInputHelp] = useState([]);
  const formikRef = useRef<FormikProps<MyFormValues>>(null);

  const setAddress = useCallback(addr => setFormInput(addr), []);
  const setCoordinates = useCallback(coords => setAddressCoordinates(coords), []);

  //const formikRef = useRef<React.MutableRefObject<null>>(null || formik); 

  useEffect(() => {
    //@ts-ignore    
    yandexMaps = new YandexMaps({ ymaps, setAddress, setCoordinates });
    yandexMaps.ymaps.ready(() => {
      yandexMaps.init();

      //yandexMaps.renderOneObject(entities);
      /* if (entities.length > 1) {
        yandexMaps.renderAllObjec  ts(entities);
        return;
      };
  
      if (entities.coords) {
        yandexMaps.renderOneObject(entities);
      }; */
    });
  }, []);

  useEffect(() => {
    if (formInput.length < 3 || inputHelp.length === 0)
      setShowInputHelp(false);
  }, [formInput.length, inputHelp.length])

  useEffect(() => {
    formikRef.current?.setFieldValue('coords', addressCoordinates);
  }, [addressCoordinates]);

  useEffect(() => {
    formikRef.current?.setFieldValue('address', formInput);
  }, [formInput]);

  const searchAddressYmaps = useCallback((val) => {
    yandexMaps.ymaps.suggest(val, { results: 5 })
      //@ts-ignore    
      .then((items: any[]) => setInputHelp(items.map(item => item.value)));
  }, []);

  const handleAddressChange = useCallback((e) => {
    formikRef.current?.setFieldValue('coords', '');
    setFormInput(e.target.value);

    if (e.target.value.length > 2) {
      searchAddressYmaps(e.target.value);

      setShowInputHelp(true);
    };

  }, [searchAddressYmaps]);

  const handleInputHelpClick = useCallback(async (e) => {
    setFormInput(e.target.value);
    setShowInputHelp(false);
    yandexMaps.createPlacemark(e.target.value);

  }, []);

  return (
    <>
      <Formik
        innerRef={() => formikRef}
        initialValues={initialValues}
        validationSchema={Schema}
        onSubmit={(values, { setSubmitting }) => {
          console.log(values);
        }}
      >
        {({ isSubmitting, errors, touched, isValid, values, setFieldValue }) => (
          <Form className="">
            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label className="mr-3">Откуда:</label>
                  <Field
                    name="address"
                    className={`form-control form-control-lg form-control-solid ${touched.address && errors.address && "is-invalid"}`}
                    placeholder="Адрес объекта"
                    value={formInput}
                    onChange={(e: any) => handleAddressChange(e)}
                    autoComplete="off"
                  />
                  {(errors.address && touched.address) && <div className="invalid-feedback">{errors.address}</div>}
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
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-6">
                <div className="form-group d-flex">
                  <label className="mr-3">Подходящий экипаж:</label>
                  <p>Шевроле</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-8">
                <div className="map" id="map"></div>
              </div>
              <div className="col-4">
                <ul className="carsList">
                  <li className="car">
                    33344545
                  </li>
                </ul>
              </div>
            </div>
            <div className="row justify-content-center mt-3">
              <Button>Заказать</Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};