import NodeCache from "node-cache";

// Cache with 5 minute TTL - prevents hitting rate limits on Yahoo/Google
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export default cache;
