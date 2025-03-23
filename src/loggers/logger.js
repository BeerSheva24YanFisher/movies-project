import { createStream } from "rotating-file-stream";
import morgan from "morgan";

const stream = "console";
const streamAuth = "console";
const morganType = "dev";

export const logger = morgan(morganType, {
    stream: getStream(stream),
    skip: (req, res) => res.statusCode == 401 || res.statusCode == 403
});
export const loggerAuth = morgan(morganType, {
    stream: getStream(streamAuth),
    skip: (req, res) => res.statusCode != 401 && res.statusCode != 403
});

function getStream(stream) {
    const pad = num => (num > 9 ? "" : "0") + num;
    const fileNameGenerator = (time, index) => {
        let res = stream;
        if (time) {
            const month = time.getFullYear() + "" + pad(time.getMonth() + 1);
            const day = pad(time.getDate());
            res = `${month}${day}-${index}-${stream}`;
        }
        return res;
    };
    return stream == "console" ? process.stdout : createStream(fileNameGenerator, {
        "size": "10M",
        "interval": "1d",
        "path": "logs"
    });
}