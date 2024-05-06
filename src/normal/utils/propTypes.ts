import { arrayOf, date as dateProp, number, shape, string } from "prop-types";

export const MultiLineDataItemsPropTypes = arrayOf(
  shape({
    date: dateProp,
    value: number,
    marketvalue: number,
  }),
);

export const MultiLineDataPropTypes = arrayOf(
  shape({
    name: string,
    items: MultiLineDataItemsPropTypes,
    color: string,
  }),
);
