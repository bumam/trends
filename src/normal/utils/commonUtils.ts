import * as d3 from "d3";
import moment from "moment";

export const formatPriceUSD = (price: number | string): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    price,
  );

export const formatPercent = (percent: number | string = 0): string => {
  let result = "0.00%";
  const isNumber: boolean = typeof percent === "number";
  const isString: boolean = typeof percent === "string";
  const isNotNaN: boolean = !Number.isNaN(parseFloat(String(percent)));

  if ((isNumber || isString) && isNotNaN) {
    result = `${parseFloat(String(percent)) > 0 ? "+" : ""}${d3.format(".2%")(
      percent / 100,
    )}`;
  }
  return result;
};

export const getPeriod = (date: moment.MomentInput): number => {
  if (!date) return 6;
  const now = moment();
  const before = moment(date);
  const duration = moment.duration(now.diff(before));
  return duration.asMonths();
};

export const getXTicks = (months: number): any => {
  if (months <= 2) return d3.timeDay.every(5).filter((d) => d.getDate() !== 31);
  if (months <= 6) return d3.timeMonth.every(1);
  if (months <= 13) return d3.timeMonth.every(2);
  return d3.timeYear.every(1);
};

export const getXTickFormat = (months: number): any => {
  if (months <= 2) return d3.timeFormat("%d %b");
  if (months <= 6) return d3.timeFormat("%b");
  if (months <= 13) return d3.timeFormat("%b %Y");
  return d3.timeFormat("%Y");
};
