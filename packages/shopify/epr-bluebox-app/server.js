import { notFound, onError } from "../../common/errors.js";
import gdpr from "./routes/gdpr.js";
import { harden } from "./mw/security.js";
console.log('shopify v3.4.4 server');
harden(app);
app.use("/gdpr", gdpr);
app.use(notFound);
app.use(onError);
