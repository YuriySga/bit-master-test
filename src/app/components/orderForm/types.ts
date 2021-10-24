export interface MyFormValues {
    address: string;
};

export interface IPosition {
    address: string,
    lat: number,
    lon: number,
};

export interface IGetCrewsQuery {
    source_time: string,
    addresses: [IPosition],
};

export interface ICreateOrderQuery {
    source_time: string,
    addresses: [IPosition],
    crew_id: number,
};

export interface ICrew {
    crew_id: 123,
    car_mark: string,
    car_model: string,
    car_color: string,
    car_number: string,
    driver_name: string,
    driver_phone: string,
    lat: number,
    lon: number,
    distance: number
}

export interface IOrderFormState {
    crewsLoading: boolean,
    orderLoading: boolean,
    entities: ICrew[],
    orderId: null | number,
    error: null | string
};

export interface IState {
    taxi: IOrderFormState
};

export interface IRouteLength {
    id: number,
    length: number
}

export interface ISimpleCrew {
    id: number,
    car_number: string,
    car_mark: string,
    car_model: string,
    car_color: string,
    distance: number | undefined
}

export interface IYandexSuggestItem {
    displayName: string,
    value: string,
}