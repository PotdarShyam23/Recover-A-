import mongoose from 'mongoose';

let isConnected = false;

function sanitizeMongoUri(rawUri) {
  if (!rawUri || !rawUri.startsWith('mongodb')) return rawUri;
  const protocolIndex = rawUri.indexOf('://');
  if (protocolIndex === -1) return rawUri;
  const lastAtIndex = rawUri.lastIndexOf('@');
  if (lastAtIndex === -1 || lastAtIndex < protocolIndex) return rawUri;

  const protocol = rawUri.slice(0, protocolIndex + 3);
  const userinfo = rawUri.slice(protocolIndex + 3, lastAtIndex);
  const hostAndOptions = rawUri.slice(lastAtIndex + 1);

  const colonIndex = userinfo.indexOf(':');
  if (colonIndex === -1) return rawUri;

  const username = decodeURIComponent(userinfo.slice(0, colonIndex));
  const password = decodeURIComponent(userinfo.slice(colonIndex + 1));

  return `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostAndOptions}`;
}

export async function connectDB() {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri || rawUri.includes('<username>') || rawUri.includes('<password>')) {
    console.warn('\n⚠️ [MongoDB] MONGODB_URI is not set or contains placeholder credentials in .env.');
    console.warn('👉 Please paste your MongoDB Atlas cluster connection string in .env:\n');
    return false;
  }

  const uri = sanitizeMongoUri(rawUri);

  try {
    if (mongoose.connection.readyState >= 1) {
      isConnected = true;
      return true;
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });

    isConnected = true;
    console.log(`✅ [MongoDB] Connected successfully to Atlas Cluster: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ [MongoDB] Connection error:', error.message);
    return false;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export default connectDB;
