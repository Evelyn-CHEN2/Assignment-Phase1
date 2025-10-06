## Git repository
- Create a new Git repository named **`Assignment-Phase1`**, clone it locally, and open it in VS Code.
- Initialize npm and install the required packages.
- Create a working branch **`phase1`**.
- Merge cadence: **front-end** changes to `master`/`main` almost daily; **server** changes every **2–3 days**.

## Data structure
- **Server-side models:**
```ts
class User {
    constructor(id, username, email, pwd, role, groups, valid) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.pwd = pwd;
        this.role = role;
        this.groups = groups || [];
        this.valid = valid ;
    }
}

class Group {
    constructor(id, groupname, description, channels, createdBy, admins) {
        this.id = id;
        this.groupname = groupname;
        this.description = description || '';
        this.channels = channels || [];
        this.createdBy = createdBy; // Store user id, user name might change
        this.admins = admins || []; // Store user ids of admins
    }
}

class Channel {
    constructor(id, channelname, groupid, messages) {
        this.id = id;
        this.channelname = channelname;
        this.groupid = groupid;
        this.messages = messages || [];
    }
}

class Notification {
    constructor(id, applier, groupToApply, status, approvedBy) {
        this.id = id;
        this.applier = applier; // Store user ID
        this.groupToApply = groupToApply; // Store group ID
        this.status = status; // pending, approved
        this.approvedBy = approvedBy; // Store user ID(super/admin)
    }
}
```
- **Client-side models:** `interface.ts` mirrors the server classes **1:1** (same properties and types).

## Angular architecture
- **Components:** `account`, `chatwindow`, `dashboard`, `group-form`, `groups`, `header`, `login`, `notifications`, `register`, `users` (users list viewed by admin/super)
- **Services:** `auth.service`, `groups.service`, `notification.service`, `user.service`, `socket.service`
- **Models:** `interface.ts`
- **Routes:**
  - `' '` → `Login`
  - `'login'` → `Login`
  - `'register'` → `Register`
  - `'account'` → `Account`
  - `'chatwindow/:id'` → `Chatwindow` (open a specific channel)
  - `'dashboard'` → `Dashboard`
    - **children:**
      - `'users'` → `Users`
      - `'groups'` → `Groups`
      - `'group-form'` → `GroupForm`
      - `'notifications'` → `Notifications`
- **front-end architecture**
- `index.html`: static host page.
- `main.ts`: Angular bootstrap entry.
- `app.ts`: `app.html` / `app.css` — root component (the app shell).
- `app.config.ts`: global providers (e.g., HttpClient, router).
- `app.routes.ts`: route table for the whole app.
- `interface.ts`: shared TypeScript interfaces (User, Group, Channel, …).
- `services/user.service.ts`: REST calls for users.
- `services/socket.service.ts`: Socket.IO client for `/channelChat` (join/leave/send).
- `guards/`: auth/admin guards (e.g., `authGuard`).
- `components/`: each folder is one feature/page.

## API routes
| File                          | Params                                                                 | Returns           | Purpose                                                                                                                                           |
|------------------------------|-------------------------------------------------------------------------|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `api-login.js`               | `username`, `pwd`                                                       | `user`            | Match username and password with data; return user to store in `localStorage`.                                                                    |
| `api-register.js`            | `username`, `email`, `pwd`                                              | `user`            | Create a new user and return it to store in `localStorage`.                                                                                       |
| `api-fetchallusers.js`       | —                                                                       | `users`           | Send `GET` to server to retrieve all users.                                                                                                       |
| `api-fetchuserByID.js`       | `user.id`                                                               | `user`            | Send `user.id` to server to find the user and return the matched user.                                                                            |
| `api-updateuserrole.js`      | `user.id`, `group.id`, `newRole`                                        | —                 | Update user role in a certain group for the selected user.                                                                                        |
| `api-addgrouptouser.js`      | `user.id`, `group.id`, `notification.id`                                | —                 | Add `group.id` to `user.groups`, and update notification status with `notification.id`.                                                           |
| `api-deleteuser.js`          | `user.id`                                                               | —                 | Delete matched user on server.                                                                                                                    |
| `api-removeuserfromgroup.js` | `user.id`, `group.id`                                                   | —                 | Remove `group.id` from matched `user.groups`.                                                                                                     |
| `api-banuserByID.js`         | `user.id`                                                               | —                 | Set matched user’s `valid` to `false`.                                                                                                            |
| `api-unbanuserByID.js`       | `user.id`                                                               | —                 | Set matched user’s `valid` to `true`.                                                                                                             |
| `api-fetchallgroups.js`      | —                                                                       | `groups`          | Use `GET` to retrieve all groups.                                                                                                                 |
| `api-creategroup.js`         | `groupname`, `description`, `channelNames`, `currentUser`               | `group`           | Create a new group with new `channelNames` (store channel IDs); add creator (`currentUser.id`) to `group.admins`; add new `group.id` to creator. |
| `api-deletegroupfromuser.js` | `group.id`, `user.id`                                                   | —                 | Find the matched user with `user.id`, delete `group.id` from `user.groups`.                                                                       |
| `api-editgroup.js`           | `group.id`, `groupname`                                                 | —                 | Find the matched group and edit its `groupname`.                                                                                                  |
| `api-deletegroup.js`         | `group.id`                                                              | —                 | Find the matched group and delete it from server.                                                                                                 |
| `api-fetchallchannels.js`    | —                                                                       | `channels`        | Send `GET` to server to retrieve all channels.                                                                                                    |
| `api-createchannel.js`       | `group.id`, `channelName`                                               | `channel`         | Create a new channel and add the new `channel.id` to the matched group.                                                                           |
| `api-deletechannel.js`       | `channel.id`                                                            | —                 | Find the matched channel and delete it from server.                                                                                               |

## Details of interaction
### REST (HTTP)
- **GET** – read from JSON files (users, groups, channels, notifications).
- **POST** – create records and append to JSON files.
- **PUT** – update existing records (path or query includes the specific id).  
  Typically responds with **204 No Content** when no body is expected.
- **Persistence** – mutations are saved via:
  `writeUsers(...)`, `writeGroups(...)`, `writeChannels(...)`, `writeNotifications(...)`.
- **DELETE** – e.g.  
  `DELETE /api/removeuserfromgroup?userId=<uid>&groupId=<gid>`  
  removes `groupId` from `users[uid].groups`.

### Socket.IO (`/channelChat` namespace)

- `joinChannel({ channelId, senderName })` - server `socket.join(channelId)`, broadcast a **notice**, emit updated **userNum**.
- `leaveChannel({ channelId, senderName })` - server `socket.leave(channelId)`, broadcast a **notice**, emit updated **userNum**.
- `chatMsg({ channelId, sender, message })` - broadcast `{ channelId, sender, message, timestamp }` to the room.
- `reqUserNum(channelId)` - emit `{ channelId, userNum }` back to the requester.
- **disconnect** - server recomputes room counts for any rooms the socket was in and may broadcast a generic “user disconnected” notice.

----------------------------------------- Assignement phase-2 dividing line ---------------------------------------------------------------
## Git repository
- Create a tag named **`Phase2`** to start phase2 of assignemnt.
- Merge cadence: changes to `master` from branch master directly.

## Data structure
- **Server-side models:**
```MongoDB
db.createCollection("users", {
  validator: {
    "$jsonSchema": {
      "bsonType": "object",
      "required": [
        "_id",
        "avatar",
        "email",
        "groups",
        "pwd",
        "username",
        "valid",
        "isSuper"
      ],
      "properties": {
        "_id": {
          "bsonType": "objectId"
        },
        "avatar": {
          "bsonType": ["string", "null"]
        },
        "email": {
          "bsonType": "string"
        },
        "groups": {
          "bsonType": "array",
          "items": {
            "bsonType": "objectId"
          }
        },
        "pwd": {
          "bsonType": "string"
        },
        "username": {
          "bsonType": "string"
        },
        "valid": {
          "bsonType": "bool"
        },
        "isSuper": {
          "bsonType": "bool"
        }
      }
    }
  }
});

db.createCollection("groups", {
  validator: {
    "$jsonSchema": {
      "bsonType": "object",
      "required": [
        "_id",
        "channels",
        "createdBy",
        "description",
        "groupname"
      ],
      "properties": {
        "_id": {
          "bsonType": "objectId"
        },
        "channels": {
          "bsonType": "array",
          "items": {
            "bsonType": ["objectId", "null"]
          }
        },
        "createdBy": {
          "bsonType": "objectId"
        },
        "description": {
          "bsonType": "string"
        },
        "groupname": {
          "bsonType": "string"
        }
      }
    }
  }
});

db.createCollection("channels", {
  validator: {
    "$jsonSchema": {
      "bsonType": "object",
      "required": [
        "_id",
        "channelname",
        "groupId",
        "chatMsg"
      ],
      "properties": {
        "_id": {
          "bsonType": "objectId"
        },
        "channelname": {
          "bsonType": "string"
        },
        "groupId": {
          "bsonType": ["objectId", "null"]
        },
        "chatMsg": {
          "bsonType": "array",
          "items": {
            "bsonType": "objectId"
          }
        }
      }
    }
  }
});

db.createCollection("chatMsgs", {
  validator: {
    "$jsonSchema": {
      "bsonType": "object",
      "required": [
        "_id",
        "channelId",
        "message",
        "sender",
        "timestamp"
      ],
      "properties": {
        "_id": {
          "bsonType": "objectId"
        },
        "channelId": {
          "bsonType": "objectId"
        },
        "message": {
          "bsonType": "string"
        },
        "sender": {
          "bsonType": "objectId"
        },
        "timestamp": {
          "bsonType": "date"
        }
      }
    }
  }
});

db.createCollection("notifications", {
  validator: {
    "$jsonSchema": {
      "bsonType": "object",
      "required": [
        "_id",
        "applier",
        "groupToApply",
        "status",
        "approvedBy",
        "timestamp"
      ],
      "properties": {
        "_id": {
          "bsonType": "objectId"
        },
        "applier": {
          "bsonType": "objectId"
        },
        "groupToApply": {
          "bsonType": "objectId"
        },
        "status": {
          "bsonType": "string"
        },
        "approvedBy": {
          "bsonType": ["objectId", "null"]
        },
        "timestamp": {
          "bsonType": "date"
        }
      }
    }
  }
});

db.createCollection("membership", {
  validator: {
    "$jsonSchema": {
      "bsonType": "object",
      "required": [
        "_id",
        "role",
        "admin",
        "groups"
      ],
      "properties": {
        "_id": {
          "bsonType": "objectId"
        },
        "role": {
          "bsonType": "string"
        },
        "admin": {
          "bsonType": "objectId"
        },
        "groups": {
          "bsonType": "array",
          "items": {
            "bsonType": "objectId"
          }
        }
      }
    }
  }
});

db.createCollection("banReports", {
  validator: {
    "$jsonSchema": {
      "bsonType": "object",
      "required": [
        "_id",
        "channelIds",
        "userId"
      ],
      "properties": {
        "_id": {
          "bsonType": "objectId"
        },
        "channelIds": {
          "bsonType": "array",
          "items": {
            "bsonType": "objectId"
          }
        },
        "userId": {
          "bsonType": "objectId"
        }
      }
    }
  }
});

```
- **Client-side models:** `interface.ts` used on the client side to ensure type dafety and mirror the server's data structure **1:1** (same properties and types).

### Where It’s Used
- **HTTP Services:** define request/response object shapes  
- **Components & Forms:** type local state and bindings  
- **Selectors & Utilities:** ensure consistent property names everywhere

## Division of Responsibilities Between Client and Server
- **Client (Frontend):**
  - Built with Angular.
  - Handles all **UI rendering**, **form inputs**, and **client-side routing**.
  - Communicates with the backend using **HTTP requests**.
  - Displays data received in **JSON** format (e.g., user informations, group lists, chat messages).

- **Server (Backend):**
  - Implemented using Node.js and Express.
  - Provides a **RESTful API** that returns JSON responses for all client requests.
  - Handles **business logic**, **database operations**, and **validation**.

## Client-Server Communication
  - The client sends requests like:
    - `GET /api/allgroups` → returns a list of groups in JSON.
    - `POST /api/register` → creates a new user.
  - The client uses ISON responses to **update the UI** dynamically.

### REST (HTTP) — backed by **MongoDB**
- **GET** – read from **MongoDB collections** (`users`, `groups`, `channels`, `notifications`, `chatMsgs`).
  - Examples:  
    - `GET /api/fetchuserbyID/:id` → `users.findOne({ _id: ObjectId(id) })` (return JSON object) 
    - `GET /api/fetchallgroups` → `groups.find().toArray()` (return JSON array)

- **POST** – create **new documents** or handle uploads.
  - Examples:  
    - `POST /api/register` → `users.insertOne({...})` (returns `{ insertedId }`)  
    - `POST /api/uploadavatar/:userId/avatar` → uploads user avatar via `multer`,  
      converts the file buffer to **Base64**, stores it in MongoDB,  
      and returns `{ avatar: avatarUrl }` for immediate frontend update.

- **PUT** – update **existing documents** by `_id` (or query).
  - Typical response: **204 No Content** if no body returned.  
  - Examples:  
    - `PUT /api/updateuser/:userId` → `users.updateOne({ _id: ObjectId(id) }, { $set: body })`  

- **DELETE** – remove documents **or** specific array elements.
  - Examples:  
    - `DELETE /api/deletenotification/:id` → `notifications.deleteOne({ _id: ObjectId(id) })`  
    - Remove a user from groups:
      - `DELETE /api/removeuserfromgroup`  
        → `users.updateOne({ _id: ObjectId(uid) }, { $pull: { groups: groupId } })`

- **Persistence details** – all mutations use the **MongoDB Node.js driver**:
  - `insertOne(...)`, `findOne(...)`, `find(...)`, `updateOne(...)`, `deleteOne(...)`
  - Convert route params/query/body to `ObjectId` using `new ObjectId(id)`

### Socket.IO (`/channelChat` namespace)
- `joinChannel({ channelId, senderName })` - server `socket.join(channelId)`, broadcast a **notice**, emit updated **userNum**.
- `leaveChannel({ channelId, senderName })` - server `socket.leave(channelId)`, broadcast a **notice**, emit updated **userNum**.
- `chatMsg({ channelId, sender, message })` - broadcast `{ channelId, sender, message, timestamp }` to the room.
- `reqUserNum(channelId)` - emit `{ channelId, userNum }` back to the requester.
- **disconnect** - server recomputes room counts for any rooms the socket was in and broadcast a generic “User disconnected from channelChat namespace” notice.
- **Persistence:** all messages stored in `chatMsgs` using the **MongoDB Node.js driver**

## API routes
| File                          | Params                                                                 | Returns           | Purpose                                                                                                                                           |
|------------------------------|-------------------------------------------------------------------------|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `api-login.js`               | `username`, `pwd`                                                       | `user`            | Match username and password with data; return user to store in `localStorage`.                                                                    |
| `api-register.js`            | `username`, `email`, `pwd`                                              | `user`            | Create a new user document and return it to store in `localStorage`.                                                                              |
| `api-fetchallusers.js`       | —                                                                       | `users`           | Send `GET` to server to retrieve all users.                                                                                                       |
| `api-fetchuserByID.js`       | `user._id`                                                              | `user`            | Send `user._id` to server to find the user and return the matched user.                                                                           |
| `api-updateuserrole.js`      | `user._id`, `group._id`, `newRole`                                      | —                 | Update user role in a certain group for the selected user.                                                                                        |
| `api-addgrouptouser.js`      | `user._id`, `group._id`, `notification.id`                              | —                 | Add `group._id` to `user.groups`, and update notification status with `notification._id`.                                                         |
| `api-deleteuser.js`          | `user._id`                                                              | —                 | Delete matched user on server.                                                                                                                    |
| `api-removeuserfromgroup.js` | `user._id`, `group._id`                                                 | —                 | Remove `group._id` from matched `user.groups`.                                                                                                    |
| `api-banuserByID.js`         | `user._id`, `channel._id`                                               | -                 | Find matched user, and disable channles in the group based on channel._id|
| `api-unbanuserByID.js`       | `user._id`, `channel._id`                                               | —                 | Find matched user, and release channles in the group based on channel._id.       |                                                                                                      |
| `api-uploadavatar.js`        | `user._id`, `avatar(file)`                                              | —                 | Upload an avatar image, convert it, stores it in MongoDB, and return `{ avatar: avatarUrl }` for immediate frontend update.                       |
| `api-fetchmembership.js`     | `user._id`                                                              | `membership`      | Use `GET` to retrieve membership which admin equals to user._id                                                                                   |
| `api-fetchallgroups.js`      | —                                                                       | `groupss`           | Send `GET` to server to retrieve all groups.                                                                                                    |
| `api-creategroup.js`         | `groupname`, `description`, `channelNames`, `currentUser`               | `group`           | Create a new group document with new `channelNames`; add creator `currentUser._id` to `group.admins`; add new `group._id` to creator.             |
| `api-leavegroup.js`          | `group._id`, `user._id`                                                 | —                 | Find the matched user with `user.id`, delete `group._id` from `user.groups`.                                                                      |
| `api-editgroup.js`           | `group._id`, `groupname`                                                | —                 | Find the matched group and edit its `groupname`.                                                                                                  |
| `api-deletegroup.js`         | `group._id`                                                             | —                 | Find the matched group and delete it from server.                                                                                                 |
| `api-fetchallchannels.js`    | —                                                                       | `channels`        | Send `GET` to server to retrieve all channels.                                                                                                    |
| `api-createchannel.js`       | `group._id`, `channelName`                                              | `channel`         | Create a new channel document and add the new `channel._id` to the matched group.                                                                 |
| `api-deletechannel.js`       | `channel._id`                                                           | —                 | Find the matched channel and delete it from server.                                                                                               |
| `api-fetchchatmessages.js`   | `channel._id`                                                           | —                 | Find the matched channel, fetch its messages, sort bt timestamp, and limit displaying number to 50.                                               |
| `api-createnotification.js`  | `user._id`, `group._id`                                                 | —                 | Create a new notification document.                                                                                                               |
| `api-fetchnotifications.js`  | -                                                                       | —                 | Send `GET` to server to retrieve all bnotifications.                                                                                              |
| `api-deletenotification.js`  | `notification_id`                                                       | —                 | Delete matched notification on server.                                                                                                            |
| `api-fetchallreports.js`     | -                                                                       | —                 | Send `GET` to server to retrieve all ban reports.                                                                                                 |

## Angular architecture
- **Components:** `account`, `chatwindow`, `dashboard`, `group-form`, `groups`, `header`, `login`, `notifications`, `register`, `users`
  - Each folder contains its own `.ts`, `html` and `css` files, and `.spec.ts` for component testing using Jasmine.
  - `users` view is restriected to **admin/super** roles.
- **Services:** `auth.service`, `groups.service`, `notification.service`, `user.service`, `socket.service`
- **Models:** `interface.ts`
- **Routes:**
  - `' '` → `Login`
  - `'login'` → `Login`
  - `'register'` → `Register`
  - `'account'` → `Account`
  - `'chatwindow/:id'` → `Chatwindow` (open a specific channel)
  - `'dashboard'` → `Dashboard`
    - **children:**
      - `'users'` → `Users`
      - `'groups'` → `Groups`
      - `'group-form'` → `GroupForm`
      - `'notifications'` → `Notifications`
- **Guards:**  
  - `authGuard` — restricts access to authenticated users.  
  - `adminGuard` — restricts access to admin/super routes like `users` and `groups`.
- **front-end file architecture**
- `index.html`: static host page.
- `main.ts`: Angular bootstrap entry.
- `app.ts`: `app.html` / `app.css` — root component (the app shell).
- `app.config.ts`: global providers (e.g., HttpClient, router).
- `app.routes.ts`: route table for the whole app.
- `interface.ts`: shared TypeScript interfaces (User, Group, Channel, …).
- `services/auth.service.ts`: REST calls for authentication.
- `services/user.service.ts`: REST calls for users.
- `services/group.service.ts`: REST calls for groups.
- `services/notification.service.ts`: REST calls for notifications.
- `services/chatmessage.service.ts`: REST calls for messages in the channel chat.
- `services/socket.service.ts`: Socket.IO client for `/channelChat` (join/leave/send).
- `components/`: each folder is one feature/page.

## Client–Server Interaction Flow
  Below are 5 examples to show how server-side data changes and how Angular components update.
### User Register
- **Component:** `register.ts`
- **Service:** `auth.service.register()`
- **Backend Route:** `api-register.js`
- **Database Change:** Inserts a new user document into the `users` collection using `insertOne({...})`.
- **Frontend Update:** The returned `user` object is saved in `localStorage` with a global `currentUser` variable, and navigates to the `account` page.

### User Login
- **Component:** `login.ts`
- **Service:** `auth.service.login()`
- **Backend Route:** `api-login.js`
- **Database Read:** `users.findOne({ username, pwd })`
- **Frontend Update:** The returned `user` object is saved in `localStorage` with a global `currentUser` variable, and navigates to the `account` page.  
  The header and dashboard components update automatically via reactive bindings.

### Fetch All Groups
- **Component:** `groups.ts`
- **Service:** `groups.service.getGroups()`
- **Backend Route:** `api-fetchallgroups.js`
- **Database Read:** `groups.find().toArray()`
- **Frontend Update:** The component’s `groups` array is populated with the returned JSON and displayed on `groups.html`.

### Join Channel and Send Chat Messages
- **Component:** `chatwindow.ts`
- **Service:** `socket.service`
- **Backend:** `socket.js` (namespace `/channelChat`)
- **Database Change:** Inserts each new chat message into the `chatMsgs` collection with `insertOne({...})`.
- **Frontend Update:** Each received `chatMsg` event triggers a UI update in the message list via `this.socket.on('chatMsg', ...)`.

### Upload Avatar
- **Component:** `account.ts`
- **Service:** `user.service.uploadAvatar()`
- **Backend Route:** `api-uploadavatar.js`
- **Database Change:** Updates the user’s `avatar` field in the `users` collection using `updateOne({ $set: { avatar: avatarUrl } })`.
- **Frontend Update:** The new avatar image is immediately displayed using the Base64 data returned from the response.

---
