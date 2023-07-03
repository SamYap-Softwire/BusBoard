import fetch from "node-fetch";
import promptModule from "prompt-sync";
const prompt = promptModule();

const main = async () => {
  // const postCode = prompt("Please enter a post code: "); //  NW51TL
  const postCode = "NW51TL";
  const postCodeToLatLonAPI = `https://api.postcodes.io/postcodes/${postCode}`;
  const latLon = await fetchByAwait(postCodeToLatLonAPI);
  const [lat, lon] = getLatLon(latLon.result);

  let radius = 200;
  const latLonToStopPointAPI = `https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${lon}&stopTypes=NaptanPublicBusCoachTram&radius=${radius}`;
  // might want to check if at least 2 are returned, else increase radius (logarithmically)
  const stopPoint = await fetchByAwait(latLonToStopPointAPI);
  const idArray = getStopPoint(stopPoint.stopPoints);

  const busArray = await generateBusArray(idArray);
  const firstFiveBusArray = getBusInfo(busArray);
  display(firstFiveBusArray);
};

// INTERFACES

interface busObject {
  lineId: number;
  destinationName: string;
  timeToStation: number;
  timeToLive: Date;
}

interface latLonObject {
  latitude: number;
  longitude: number;
}

interface stopPointObject {
  distance: number;
  naptanId: string;
}

// FETCH FROM API

const fetchByAwait = async (url: string): Promise<any> => {
  try {
    let data = await fetch(url);
    let input = await data.json();
    return input;
  } catch (error) {
    throw new Error(`${error}`); // help
  }
};

// PROCESS API RESPONSE

const getLatLon = (data: latLonObject) => {
  return [data.latitude, data.longitude];
};

const getStopPoint = (data: stopPointObject[]) => {
  const sortedData = data.sort(
    (a: stopPointObject, b: stopPointObject) => a.distance - b.distance
  );
  const firstTwo = sortedData.slice(0, 2);
  const idArray: string[] = [];
  for (const stop of firstTwo) {
    idArray.push(stop.naptanId);
  }
  return idArray;
};

const generateBusArray = async (ids: string[]) => {
  let allBusArray: busObject[] = [];
  for (const id of ids) {
    const stopPointToArrivalAPI = `https://api.tfl.gov.uk/StopPoint/${id}/Arrivals`;
    const busArray = await fetchByAwait(stopPointToArrivalAPI);
    allBusArray = allBusArray.concat(busArray);
  }
  return allBusArray;
};

const getBusInfo = (data: busObject[]) => {
  const sortedData = data.sort(
    (a: busObject, b: busObject) => a.timeToStation - b.timeToStation
  );
  const firstFive = sortedData.slice(0, 5);
  return firstFive;
};

const display = (arrivingBusArray: busObject[]) => {
  for (const bus of arrivingBusArray) {
    const returnString = `ID: ${bus.lineId}, Destination: ${
      bus.destinationName
    }, Time of arrival: ${~~(bus.timeToStation / 60)} min`;
    console.log(returnString);
  }
  // console.log(bus.timeToLive); // Check timeToLive of data (expire) - edge case of later bus catching up with earlier bus
};

// DISPLAY DATA

// ----- MAIN ----
main();
