import { MongoClient } from "mongodb";

async function setupTimestampTriggers(db, collectionName) {
  // 1. 컬렉션 생성 시 스키마 유효성 검사 설정
  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["createdAt", "updatedAt"],
        properties: {
          createdAt: {
            bsonType: "date",
            description: "생성 시간 - 필수"
          },
          updatedAt: {
            bsonType: "date",
            description: "수정 시간 - 필수"
          }
        }
      }
    }
  });

  // 2. insertOne/insertMany 작업을 위한 트리거
  await db.command({
    collMod: collectionName,
    changeStreamPreAndPostImages: { enabled: true }
  });

  const collection = db.collection(collectionName);

  // 3. 삽입 작업 전 트리거
  collection.watch([
    {
      $match: {
        operationType: "insert"
      }
    }
  ]).on('change', async (change) => {
    const now = new Date();
    const doc = change.fullDocument;

    if (!doc.createdAt) {
      await collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            createdAt: now,
            updatedAt: now
          }
        }
      );
    }
  });

  // 4. 수정 작업 전 트리거
  collection.watch([
    {
      $match: {
        operationType: "update"
      }
    }
  ]).on('change', async (change) => {
    const doc = change.fullDocument;

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          updatedAt: new Date()
        }
      }
    );
  });
}

// 사용 예시
async function example() {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('testdb');

    // 트리거 설정
    await setupTimestampTriggers(db, 'users');

    const users = db.collection('users');

    // 새 문서 삽입 - createdAt과 updatedAt이 자동으로 설정됨
    await users.insertOne({
      name: 'John',
      email: 'john@example.com'
    });

    // 문서 수정 - updatedAt이 자동으로 갱신됨
    await users.updateOne(
      { email: 'john@example.com' },
      { $set: { name: 'John Doe' } }
    );

  } catch (error) {
    console.error('Error:', error);
  }
}
