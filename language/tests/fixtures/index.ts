import path from "path";
import fs from "fs";

const readSample = (name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, "samples", name), (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data.toString());
    });
  });
};

export { readSample };
