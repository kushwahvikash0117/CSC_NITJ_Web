/**
 * @file eventRoutes.js
 * @description Express router for managing event endpoints, public registrations, and administrative actions.
 */

import express from "express";
import {
    createEvent,
    updateEvent,
    getEvents,
    registerEvent,
    getEventRegistrations,
    getPendingEvents,
    moderateEvent,
    checkRegistrationStatus,
} from "../controllers/eventController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

const eventUploads = upload.fields([
    { name: "brochure", maxCount: 1 },
    { name: "timelinePdf", maxCount: 1 }
]);

/**
 * @route   GET /api/events
 * @desc    Fetch all events sorted by date
 * @access  Public
 */
router.get("/", getEvents);

/**
 * @route   POST /api/events/:id/register
 * @desc    Register a participant for a specific event
 * @access  Public
 */
router.post("/:id/register", registerEvent);

/**
 * @route   GET /api/events/:id/check-registration
 * @desc    Check if an email address is registered for a specific event
 * @access  Public
 */
router.get("/:id/check-registration", checkRegistrationStatus);

/**
 * @route   POST /api/events
 * @desc    Create a new event with file uploads
 * @access  Private/Admin
 */
router.post("/", protect, isAdmin, eventUploads, createEvent);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an existing event with optional file attachments
 * @access  Private/Admin
 */
router.put("/:id", protect, isAdmin, eventUploads, updateEvent);

/**
 * @route   GET /api/events/:id/registrations
 * @desc    Fetch all participant registrations for an event
 * @access  Private
 */
router.get("/:id/registrations", protect, getEventRegistrations);

/**
 * @route   GET /api/events/pending
 * @desc    Fetch all pending upcoming events
 * @access  Private/Admin
 */
router.get("/pending", protect, isAdmin, getPendingEvents);

/**
 * @route   PUT /api/events/moderate/:id
 * @desc    Moderate an event status (approve/reject/pending)
 * @access  Private/Admin
 */
router.put("/moderate/:id", protect, isAdmin, moderateEvent);

export default router;