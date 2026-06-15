import { jest } from '@jest/globals';

const mockSchema = function() {
  return {};
};

const mockModel = function() {
  return {
    prototype: {
      save: jest.fn().mockImplementation(function() { return Promise.resolve(this); })
    },
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    findOneAndDelete: jest.fn().mockResolvedValue(null)
  };
};

const mongoose = {
  connect: jest.fn().mockResolvedValue(true),
  Schema: mockSchema,
  model: mockModel
};

export default mongoose;