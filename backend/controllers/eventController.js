/**
 * @file eventController.js
 * @description Controller for managing events, file uploads, participant registrations, and moderation.
 */

import Event from "../models/Event.js";
import User from "../models/User.js";

/**
 * Creates a new event with optional file attachments (brochure and timeline PDF).
 * @route POST /api/events
 */
export const createEvent = async (req, res) => {
    try {
        const { title, description, date, mode, tag, hasFee, galleryLink, registrationLink } = req.body;

        if (!title || !description || !date || !mode || !tag) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const brochure = req.files?.brochure 
            ? `/uploads/csc/blogs/${req.files.brochure[0].filename}` 
            : (req.body.brochure || "");
            
        const timelinePdf = req.files?.timelinePdf 
            ? `/uploads/csc/blogs/${req.files.timelinePdf[0].filename}` 
            : (req.body.timelinePdf || "");

        const event = await Event.create({
            title,
            description,
            date,
            mode,
            tag,
            hasFee: hasFee === "true" || hasFee === true,
            brochure,
            timelinePdf,
            galleryLink: galleryLink || "",
            registrationLink: registrationLink || "",
        });

        return res.status(201).json(event);
    } catch (error) {
        console.error("[Event Error] Creation failed:", error);
        return res.status(500).json({
            message: "Failed to create event",
            error: error.message,
        });
    }
};

/**
 * Updates an existing event and handles new file attachments if uploaded.
 * @route PUT /api/events/:id
 */
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, mode, tag, hasFee, galleryLink, registrationLink } = req.body;

        const updateData = {
            ...(title && { title }),
            ...(description && { description }),
            ...(date && { date }),
            ...(mode && { mode }),
            ...(tag && { tag }),
            ...(hasFee !== undefined && { hasFee: hasFee === "true" || hasFee === true }),
            ...(galleryLink !== undefined && { galleryLink }),
            ...(registrationLink !== undefined && { registrationLink }),
        };

        if (req.files?.brochure) {
            updateData.brochure = `/uploads/csc/blogs/${req.files.brochure[0].filename}`;
        }

        if (req.files?.timelinePdf) {
            updateData.timelinePdf = `/uploads/csc/blogs/${req.files.timelinePdf[0].filename}`;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.status(200).json(updatedEvent);
    } catch (error) {
        console.error("[Event Error] Update failed:", error);
        return res.status(500).json({
            message: "Failed to update event",
            error: error.message,
        });
    }
};

/**
 * Fetches all events sorted by upcoming date.
 * @route GET /api/events
 */
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        return res.status(200).json(events);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch events",
            error: error.message,
        });
    }
};

/**
 * Registers a participant for a specific event.
 * @route POST /api/events/:id/register
 */
export const registerEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            salutation,
            name,
            category,
            typeOfParticipant,
            country,
            designation,
            instituteName,
            mobile,
            email,
        } = req.body;

        if (
            !salutation ||
            !name ||
            !category ||
            !typeOfParticipant ||
            !country ||
            !designation ||
            !instituteName ||
            !mobile ||
            !email
        ) {
            return res.status(400).json({ message: "All registration fields are required" });
        }

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const normalizedEmail = email.toLowerCase();
        const alreadyRegistered = event.registrations.some(
            (reg) => reg.email.toLowerCase() === normalizedEmail
        );

        if (alreadyRegistered) {
            return res.status(400).json({ message: "This email is already registered for the event" });
        }

        event.registrations.push({
            salutation,
            name,
            category,
            typeOfParticipant,
            country,
            designation,
            instituteName,
            mobile,
            email,
        });

        await Promise.all([
            event.save(),
            User.findOneAndUpdate(
                { email: normalizedEmail },
                { $addToSet: { registeredEvents: event._id } }
            )
        ]);

        return res.status(201).json({ message: "Successfully registered for the event!" });
    } catch (error) {
        console.error("[Event Error] Registration failed:", error);
        return res.status(500).json({
            message: "Failed to process registration",
            error: error.message,
        });
    }
};

/**
 * Fetches all registrations for a particular event (Admin use).
 * @route GET /api/events/:id/registrations
 */
export const getEventRegistrations = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id).select("title registrations");
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.status(200).json({
            title: event.title,
            totalRegistrations: event.registrations.length,
            registrations: event.registrations,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch registrations",
            error: error.message,
        });
    }
};

/**
 * Fetches pending or upcoming events.
 * @route GET /api/events/pending
 */
export const getPendingEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pendingEvents = await Event.find({
            date: { $gt: today },
            status: "pending",
        }).sort({ date: 1 });

        return res.status(200).json(pendingEvents);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch pending events",
            error: error.message,
        });
    }
};

/**
 * Moderates an event status (Approve, Reject, or Pending).
 * @route PATCH /api/events/:id/moderate
 */
export const moderateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["approved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value provided" });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.status(200).json({
            message: `Event successfully marked as ${status}`,
            event: updatedEvent,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to moderate event",
            error: error.message,
        });
    }
};

/**
 * Checks if a user email is registered for a specific event.
 * @route GET /api/events/:id/check-registration
 */
export const checkRegistrationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email parameter is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        const isRegistered = user ? user.registeredEvents.some((eventId) => eventId.toString() === id) : false;

        return res.status(200).json({ 
            eventId: id,
            isRegistered 
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to check registration status",
            error: error.message,
        });
    }
};