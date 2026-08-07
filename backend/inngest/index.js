import { Inngest } from "inngest";
import { prisma } from "../config/db.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management" });

const syncUserFunction = inngest.createFunction(
    {id: 'sync-user-from-clerk',
    triggers: [{event: 'clerk/user.created'}],
    },
    async({event, step})=>{
        const{data} = event;
        await prisma.user.create({
            data: {
                id: data.id,
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + ' ' + data?.last_name,
                image: data?.image_url,
            }
        });
    }
);

//Inngest function to delete user from database when user is deleted from clerk
const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-from-clerk',
        triggers: [{ event: 'clerk/user.deleted' }]
    },
    async ({ event }) => {
        const { data } = event;
        await prisma.user.deleteMany({
            where: {
                id: data.id
            }
        });
    }
);

//Inngest function to update user in database when user is updated in clerk
// Inngest function to update/create user in database when user is updated in clerk
const syncUserUpdate = inngest.createFunction(
    {
        id: 'update-user-from-clerk',
        triggers: [{ event: 'clerk/user.updated' }]
    },
    async ({ event }) => {
        const { data } = event;
        const userData = {
            email: data?.email_addresses[0]?.email_address,
            name: (data?.first_name || '') + ' ' + (data?.last_name || ''),
            image: data?.image_url,
        };

        await prisma.user.upsert({
            where: {
                id: data.id,
            },
            update: userData,
            create: {
                id: data.id,
                ...userData,
            },
        });
    }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserFunction,
    syncUserDeletion,
    syncUserUpdate
];