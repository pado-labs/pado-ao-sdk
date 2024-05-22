import { listData } from "../index";

const test = async() => {
  const validData = await listData();
  console.log("valid length=", validData.length);
  const allData = await listData("All");
  console.log("valid length=", allData.length);
  const invalidData = await listData("Invalid");
  console.log("valid length=", invalidData.length);
}

test();