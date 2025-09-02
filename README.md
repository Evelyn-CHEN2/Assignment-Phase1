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

## Node server architecture
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
