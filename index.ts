import fetch from "node-fetch";
const prompt = require("prompt-sync")();

const stopCode = prompt("Please enter a stop code: ");
const url = `https://api.tfl.gov.uk/StopPoint/${stopCode}/Arrivals`;

const doByThen = () => {
  fetch(url)
    .then((response) => {
      return response.json().then(output);
    })
    .catch((error) => {
      console.log(error);
    });
};

async function doByAwait() {
  try {
    let data = await fetch(url);
    let input = await data.json();
    output(input);
  } catch (error) {
    console.log(error);
  }
}

interface tflReturn {
  lineId: number;
  destinationName: string;
  timeToStation: number;
  timeToLive: Date;
}

const output = (data: tflReturn[]) => {
  const sortedData = data.sort(
    (a: tflReturn, b: tflReturn) => a.timeToStation - b.timeToStation
  );
  const firstFive = sortedData.slice(0, 5);
  for (const bus of firstFive) {
    const returnString = `ID: ${bus.lineId}, Destination: ${
      bus.destinationName
    }, Time of arrival: ${~~(bus.timeToStation / 60)} min`;
    console.log(returnString);
    console.log(bus.timeToLive);
  }
};

doByAwait();
// doByThen();

// 490008660N

// Check timeToLive of data (expire) - edge case of later bus catching up with earlier bus
