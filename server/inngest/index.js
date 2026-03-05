import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/Story.js";

// A client to send and receive events
export const inngest = new Inngest({ id: "xomoy-app" });

// Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        let username = email_addresses[0].email_address.split('@')[0]

        // Check availability of username
        const user = await User.findOne({ username })

        if (user) {
            username = username + Math.floor(Math.random() * 10000)
        }

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
            username
        }

        await User.create(userData)
    }
)

// Inngest function to update user data to a database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        const updatedUserData = {
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url
        }
        await User.findByIdAndUpdate(id, updatedUserData)
    }
)

// Inngest function to delete user data to a database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { id } = event.data;
        await User.findByIdAndDelete(id);
    }
)

// Inngest function to send Reminder when a new connection request is added
const sendNewConnectionRequestReminder = inngest.createFunction(
    { id: "send-new-connection-request-reminder" },
    { event: "app/connection-request" },
    async ({ event, step }) => {
        const { connectionId } = event.data;

        await step.run('send-connection-request-email', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
            const subject = '👋 New Connection Request';
            const body = `
            <div style="font-family: Arial, sans-serif; background-color:#f3f4f6; padding:40px 0;">

  <div style="max-width:520px; margin:auto; background:#ffffff; padding:30px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">

    <h2 style="margin-top:0; color:#111827;">
      Hi ${connection.to_user_id.full_name},
    </h2>

    <p style="font-size:15px; color:#374151; line-height:1.6;">
      <strong>${connection.from_user_id.full_name}</strong> 
      (@${connection.from_user_id.username}) has sent you a connection request.
    </p>

    <div style="text-align:center; margin:30px 0;">
      <a href="${process.env.FRONTEND_URL}/connections"
         style="background-color:#10b981; 
                color:#ffffff; 
                padding:12px 28px; 
                text-decoration:none; 
                border-radius:8px; 
                font-weight:bold; 
                font-size:14px;
                display:inline-block;">
        View Request
      </a>
    </div>

    <p style="font-size:13px; color:#6b7280; text-align:center;">
      Accept or reject the request from your connections page.
    </p>

    <hr style="border:none; border-top:1px solid #e5e7eb; margin:25px 0;" />

    <p style="font-size:14px; color:#4b5563;">
      Thanks,<br/>
      <strong style="color:#10b981;">Xomoy</strong><br/>
      <span style="font-size:12px;">Stay Connected, Be Proud Assamese ❤️</span>
    </p>

  </div>

</div>`;
            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })
        })

        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await step.sleepUntil("wait-fro-24-hours", in24Hours);
        await step.run('send-connection-request-reminder', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');

            if(connection.status === 'accepted'){
                return { message: "Already accepted"}
            }
            const subject = '👋 New Connection Request Reminder';
            const body = `
            <div style="font-family: Arial, sans-serif; background-color:#f3f4f6; padding:40px 0;">

  <div style="max-width:520px; margin:auto; background:#ffffff; padding:30px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">

    <!-- Reminder Badge -->
    <div style="background-color:#fef3c7; color:#92400e; padding:8px 14px; border-radius:20px; display:inline-block; font-size:12px; font-weight:bold;">
      🔔 Reminder
    </div>

    <h2 style="margin-top:20px; color:#111827;">
      Hi ${connection.to_user_id.full_name},
    </h2>

    <p style="font-size:15px; color:#374151; line-height:1.6;">
      You still have a pending connection request from  
      <strong>${connection.from_user_id.full_name}</strong>  
      (@${connection.from_user_id.username}).
    </p>

    <p style="font-size:14px; color:#6b7280; line-height:1.6;">
      Don’t miss the chance to grow your network and connect with amazing people on Xomoy.
    </p>

    <!-- Button -->
    <div style="text-align:center; margin:30px 0;">
      <a href="${process.env.FRONTEND_URL}/connections"
         style="background-color:#10b981; 
                color:#ffffff; 
                padding:12px 28px; 
                text-decoration:none; 
                border-radius:8px; 
                font-weight:bold; 
                font-size:14px;
                display:inline-block;">
        Review Request
      </a>
    </div>

    <p style="font-size:13px; color:#9ca3af; text-align:center;">
      This request is still waiting for your response.
    </p>

    <hr style="border:none; border-top:1px solid #e5e7eb; margin:25px 0;" />

    <p style="font-size:14px; color:#4b5563;">
      Cheers,<br/>
      <strong style="color:#10b981;">Xomoy Team</strong><br/>
      <span style="font-size:12px;">Stay Connected, Be Proud Assamese ❤️</span>
    </p>

  </div>

</div>`;
            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })

            return {message: "Reminder sent"}
        })
    }
)


// <div style="font-family: Arial, sans-serif; padding:20px">
// <h2>Hi ${connection.to_user_id.full_name},</h2>
// <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
// <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:$10b981;">here</a> to accept or reject the request</p>
// <br/>
// <p>Thanks, <br/>Xomoy - Stay Connection, Be Proud Assamese ❤️</p>
// </div>

// Inngest function to delete story after 24 hours
const deleteStory = inngest.createFunction(
  {id: 'story-delete'},
  {event: 'app/story.delete'},
  async ({ event, step}) => {
    const { storyId } = event.data;
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await step.sleepUntil('wait-for-24-hours', in24Hours)
    await step.run('delete-story', async ()=> {
      await Story.findByIdAndDelete(storyId)
      return { message: "Story Deleted."}
    })
  }
)

// Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder
];