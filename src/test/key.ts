import { generateKey } from "../index";

const test = async() => {
  const key = await generateKey();
  console.log("key=", key.pk, key.sk);
}

test();