import type { Payload } from 'payload'

import { devUser } from './helpers/credentials.js'

export const seed = async (payload: Payload) => {
  const { totalDocs: userCount } = await payload.count({
    collection: 'users',
    where: {
      email: {
        equals: devUser.email,
      },
    },
  })

  if (!userCount) {
    await payload.create({
      collection: 'users',
      data: devUser,
    })
  }

  const { totalDocs: postCount } = await payload.count({
    collection: 'posts',
  })

  if (postCount) {
    await payload.delete({
      collection: 'posts',
      where: {
        title: {
          exists: true,
        }
      }
    })
  }

  const { totalDocs: folderCount } = await payload.count({
    collection: 'payload-folders',
  })

  if (folderCount) {
    await payload.delete({
      collection: 'payload-folders',
      where: {
        name: {
          exists: true,
        }
      }
    })
  }

  function getRandomTitle() {
    const words = [
      'Amazing', 'Quick', 'Bright', 'Silent', 'Lively', 'Brave', 'Clever', 'Happy', 'Lucky', 'Mysterious',
      'Ancient', 'Modern', 'Curious', 'Bold', 'Gentle', 'Wild', 'Calm', 'Fierce', 'Fresh', 'Epic',
      'Magic', 'Golden', 'Silver', 'Hidden', 'Secret', 'Lost', 'Found', 'Dream', 'Star', 'Moon',
      'Sun', 'Sky', 'River', 'Mountain', 'Forest', 'Ocean', 'Journey', 'Adventure', 'Story', 'Legend',
      'Path', 'Road', 'Trail', 'Quest', 'Saga', 'Chronicle', 'Memoir', 'Note', 'Idea', 'Vision'
    ];
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    return `${word1} ${word2}`;
  }

  const folderNames = Array.from({ length: 15 }, (_) => `Folder ${getRandomTitle()}`);
  const createdFolders: any[] = [];

  for (const folderName of folderNames) {
    const folder = await payload.create({
      collection: 'payload-folders',
      data: {
        name: folderName,
      },
    });
    createdFolders.push(folder);
  }

  const posts: any[] = [];
  for (const folder of createdFolders) {
    const postCount = Math.floor(Math.random() * 20) + 1;
    for (let i = 0; i < postCount; i++) {
      const post = await payload.create({
        collection: 'posts',
        data: {
          folder: folder.id,
          title: getRandomTitle(),
        },
      });
      posts.push(post);
    }
  }

  for (const folder of createdFolders) {
    const getDescendantIds = (currentId: string, folders: any[]): Set<string> => {
      const descendants = new Set<string>();
      const stack = [currentId];
      while (stack.length) {
        const id = stack.pop();
        for (const f of folders) {
          if (f.folder === id && !descendants.has(f.id)) {
            descendants.add(f.id);
            stack.push(f.id);
          }
        }
      }
      return descendants;
    };

    if (Math.random() < 0.5) {
      const descendants = getDescendantIds(folder.id, createdFolders);
      const possibleParents = createdFolders.filter(f =>
        f.id !== folder.id && !descendants.has(f.id)
      );
      if (possibleParents.length > 0) {
        const parent = possibleParents[Math.floor(Math.random() * possibleParents.length)];
        await payload.update({
          id: folder.id,
          collection: 'payload-folders',
          data: {
            folder: parent.id,
          },
        });
        folder.folder = parent.id;
      }
    }
  }
}
