import mongoose from 'mongoose';
import { DIFFICULTIES, DIFFICULTY_RULES } from '../config/gameRules.js';
import { calculateScore } from '../services/scoringService.js';

const { Schema } = mongoose;

const suspectSchema = new Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 80 },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    alibi: { type: String, required: true, trim: true, maxlength: 1000 },
    motive: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { _id: false, strict: 'throw' },
);

const clueSchema = new Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 1500 },
    privateMeaning: { type: String, required: true, trim: true, maxlength: 1500 },
  },
  { _id: false, strict: 'throw' },
);

const solutionSchema = new Schema(
  {
    culpritId: { type: String, required: true, trim: true, maxlength: 80 },
    explanation: { type: String, required: true, trim: true, maxlength: 3000 },
    reasoning: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { _id: false, strict: 'throw' },
);

const accusationSchema = new Schema(
  {
    suspectId: { type: String, required: true, trim: true, maxlength: 80 },
    isCorrect: { type: Boolean, required: true },
    submittedAt: { type: Date, required: true },
  },
  { _id: false, strict: 'throw' },
);

const scoreSchema = new Schema(
  {
    basePoints: { type: Number, required: true, min: 0, default: 0 },
    cluePoints: { type: Number, required: true, min: 0, default: 0 },
    hintPenalty: { type: Number, required: true, min: 0, default: 0 },
    finalScore: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false, strict: 'throw' },
);

const caseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    story: { type: String, required: true, trim: true, maxlength: 5000 },
    premise: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    difficulty: { type: String, required: true, enum: DIFFICULTIES },
    generationSource: { type: String, enum: ['gemini', 'template'], default: 'gemini' },
    suspects: {
      type: [suspectSchema],
      required: true,
      validate: {
        validator(value) {
          return value.length === DIFFICULTY_RULES[this.difficulty]?.suspects;
        },
        message: 'Suspect count must match the selected difficulty.',
      },
    },
    clues: {
      type: [clueSchema],
      required: true,
      validate: {
        validator(value) {
          return value.length === DIFFICULTY_RULES[this.difficulty]?.clues;
        },
        message: 'Clue count must match the selected difficulty.',
      },
    },
    hints: {
      type: [{ type: String, required: true, trim: true, maxlength: 500 }],
      required: true,
      validate: {
        validator(value) {
          return value.length === DIFFICULTY_RULES[this.difficulty]?.hints;
        },
        message: 'Hint count must match the selected difficulty.',
      },
    },
    solution: { type: solutionSchema, required: true },
    discoveredClueIds: {
      type: [{ type: String, trim: true, maxlength: 80 }],
      default: [],
      validate: {
        validator(value) {
          return new Set(value).size === value.length;
        },
        message: 'Discovered clue IDs must be unique.',
      },
    },
    hintsUsed: {
      type: Number,
      min: 0,
      default: 0,
      validate: {
        validator(value) {
          return value <= (DIFFICULTY_RULES[this.difficulty]?.hints ?? 0);
        },
        message: 'Hints used cannot exceed the difficulty limit.',
      },
    },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    accusation: { type: accusationSchema, default: null },
    score: { type: scoreSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    strict: 'throw',
    versionKey: false,
  },
);

caseSchema.index({ createdAt: 1 });

caseSchema.pre('validate', function validateCaseIntegrity() {
  const suspectIds = this.suspects.map((suspect) => suspect.id);
  const clueIds = this.clues.map((clue) => clue.id);
  const uniqueNames = this.suspects.map((suspect) => suspect.name.toLocaleLowerCase());

  if (new Set(suspectIds).size !== suspectIds.length) {
    this.invalidate('suspects', 'Suspect IDs must be unique.');
  }
  if (new Set(uniqueNames).size !== uniqueNames.length) {
    this.invalidate('suspects', 'Suspect names must be unique.');
  }
  if (new Set(clueIds).size !== clueIds.length) {
    this.invalidate('clues', 'Clue IDs must be unique.');
  }
  if (this.solution && !suspectIds.includes(this.solution.culpritId)) {
    this.invalidate('solution.culpritId', 'Culprit ID must match a suspect in this case.');
  }
  if (this.discoveredClueIds.some((id) => !clueIds.includes(id))) {
    this.invalidate('discoveredClueIds', 'Every discovered clue ID must belong to this case.');
  }

  if (this.status === 'completed') {
    if (!this.accusation) {
      this.invalidate('accusation', 'A completed case must have a final accusation.');
      return;
    }
    if (!suspectIds.includes(this.accusation.suspectId)) {
      this.invalidate('accusation.suspectId', 'Accused suspect must belong to this case.');
      return;
    }

    const expectedCorrectness = this.accusation.suspectId === this.solution?.culpritId;
    if (this.accusation.isCorrect !== expectedCorrectness) {
      this.invalidate('accusation.isCorrect', 'Correctness must match the stored solution.');
      return;
    }

    const expectedScore = calculateScore({
      difficulty: this.difficulty,
      isCorrect: expectedCorrectness,
      discoveredClueCount: this.discoveredClueIds.length,
      hintsUsed: this.hintsUsed,
    });
    for (const field of ['basePoints', 'cluePoints', 'hintPenalty', 'finalScore']) {
      if (this.score[field] !== expectedScore[field]) {
        this.invalidate(`score.${field}`, 'Score must match the server-calculated score.');
      }
    }
  } else if (this.accusation) {
    this.invalidate('accusation', 'An active case cannot have a final accusation.');
  } else if (this.score && ['basePoints', 'cluePoints', 'hintPenalty', 'finalScore'].some((field) => this.score[field] !== 0)) {
    this.invalidate('score', 'Active cases cannot contain a final score.');
  }
});

const Case = mongoose.models.Case || mongoose.model('Case', caseSchema);
export default Case;
