import { describe, expect, it } from 'vitest';
import type { Codebook, StageSubject } from '@codaco/protocol-validation';
import {
  entityAttributesProperty,
  type NcNetwork,
} from '@codaco/shared-consts';
import type { ValidationContext } from '../types';
import { required, validations } from './index';

describe('Validation Functions', () => {
  const createMockContext = (overrides = {}): ValidationContext => ({
    subject: { entity: 'node', type: 'person' } as StageSubject,
    variable: {
      name: 'testVariable',
      type: 'text',
    } as any,
    codebook: {
      node: {
        person: {
          name: 'Person',
          color: 'blue',
          variables: {
            testAttribute: {
              name: 'Test Attribute',
              type: 'text',
            },
            numberAttribute: {
              name: 'Number Attribute',
              type: 'number',
            },
            dateAttribute: {
              name: 'Date Attribute',
              type: 'datetime',
            },
          },
        },
      },
    } as unknown as Codebook,
    network: {
      nodes: [],
      edges: [],
      ego: {
        _uid: 'ego',
        attributes: {},
      },
    } as unknown as NcNetwork,
    ...overrides,
  });

  describe('required', () => {
    it('should reject null values', () => {
      const validator = required({
        formValues: {},
        context: createMockContext(),
      });

      const result = validator.safeParse(null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'You must answer this question before continuing',
        );
      }
    });

    it('should reject undefined values', () => {
      const validator = required({
        formValues: {},
        context: createMockContext(),
      });

      const result = validator.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should reject empty strings', () => {
      const validator = required({
        formValues: {},
        context: createMockContext(),
      });

      const result = validator.safeParse('  ');
      expect(result.success).toBe(false);
    });

    it('should accept non-empty strings', () => {
      const validator = required({
        formValues: {},
        context: createMockContext(),
      });

      const result = validator.safeParse('valid text');
      expect(result.success).toBe(true);
    });

    it('should reject NaN for number fields', () => {
      const validator = required({
        formValues: {},
        context: createMockContext(),
      });

      const result = validator.safeParse(NaN);
      expect(result.success).toBe(false);
    });

    it('should accept zero for number fields', () => {
      const validator = required({
        formValues: {},
        context: createMockContext(),
      });

      const result = validator.safeParse(0);
      expect(result.success).toBe(true);
    });

    it('should reject empty arrays', () => {
      const validator = required({
        formValues: {},
        context: createMockContext(),
      });

      const result = validator.safeParse([]);
      expect(result.success).toBe(false);
    });

    it('should accept non-empty arrays', () => {
      const validator = required({
        formValues: {},
        context: createMockContext(),
      });

      const result = validator.safeParse(['item1', 'item2']);
      expect(result.success).toBe(true);
    });

    it('should accept boolean values', () => {
      const validator = required({
        formValues: {},
        context: createMockContext(),
      });

      expect(validator.safeParse(true).success).toBe(true);
      expect(validator.safeParse(false).success).toBe(true);
    });
  });

  describe('maxLength', () => {
    it('should reject strings longer than max', () => {
      const validator = validations.maxLength({
        formValues: {},
        context: createMockContext(),
        max: 5,
      });

      const result = validator.safeParse('too long');
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod's built-in max validator provides this message
        expect(result.error.issues[0]?.message).toBe(
          'Too big: expected string to have <=5 characters',
        );
      }
    });

    it('should accept strings at max length', () => {
      const validator = validations.maxLength({
        formValues: {},
        context: createMockContext(),
        max: 5,
      });

      const result = validator.safeParse('12345');
      expect(result.success).toBe(true);
    });

    it('should accept strings shorter than max', () => {
      const validator = validations.maxLength({
        formValues: {},
        context: createMockContext(),
        max: 10,
      });

      const result = validator.safeParse('short');
      expect(result.success).toBe(true);
    });

    it('should throw error when max is not specified', () => {
      expect(() => {
        validations.maxLength({
          formValues: {},
          context: createMockContext(),
        });
      }).toThrow('Max length must be specified');
    });
  });

  describe('minLength', () => {
    it('should reject strings shorter than min', () => {
      const validator = validations.minLength({
        formValues: {},
        context: createMockContext(),
        min: 5,
      });

      const result = validator.safeParse('hi');
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod's built-in min validator provides this message
        expect(result.error.issues[0]?.message).toBe(
          'Too small: expected string to have >=5 characters',
        );
      }
    });

    it('should accept strings at min length', () => {
      const validator = validations.minLength({
        formValues: {},
        context: createMockContext(),
        min: 5,
      });

      const result = validator.safeParse('12345');
      expect(result.success).toBe(true);
    });

    it('should accept strings longer than min', () => {
      const validator = validations.minLength({
        formValues: {},
        context: createMockContext(),
        min: 3,
      });

      const result = validator.safeParse('longer text');
      expect(result.success).toBe(true);
    });

    it('should throw error when min is not specified', () => {
      expect(() => {
        validations.minLength({
          formValues: {},
          context: createMockContext(),
        });
      }).toThrow('Min length must be specified');
    });
  });

  describe('minValue', () => {
    it('should reject numbers less than min', () => {
      const validator = validations.minValue({
        formValues: {},
        context: createMockContext(),
        min: 10,
      });

      const result = validator.safeParse(5);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod's built-in min validator provides this message
        expect(result.error.issues[0]?.message).toBe(
          'Too small: expected number to be >=10',
        );
      }
    });

    it('should accept numbers equal to min', () => {
      const validator = validations.minValue({
        formValues: {},
        context: createMockContext(),
        min: 10,
      });

      const result = validator.safeParse(10);
      expect(result.success).toBe(true);
    });

    it('should accept numbers greater than min', () => {
      const validator = validations.minValue({
        formValues: {},
        context: createMockContext(),
        min: 10,
      });

      const result = validator.safeParse(15);
      expect(result.success).toBe(true);
    });

    it('should throw error when min is not specified', () => {
      expect(() => {
        validations.minValue({
          formValues: {},
          context: createMockContext(),
        });
      }).toThrow('Min value must be specified');
    });
  });

  describe('maxValue', () => {
    it('should reject numbers greater than max', () => {
      const validator = validations.maxValue({
        formValues: {},
        context: createMockContext(),
        max: 10,
      });

      const result = validator.safeParse(15);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod's built-in max validator provides this message
        expect(result.error.issues[0]?.message).toBe(
          'Too big: expected number to be <=10',
        );
      }
    });

    it('should accept numbers equal to max', () => {
      const validator = validations.maxValue({
        formValues: {},
        context: createMockContext(),
        max: 10,
      });

      const result = validator.safeParse(10);
      expect(result.success).toBe(true);
    });

    it('should accept numbers less than max', () => {
      const validator = validations.maxValue({
        formValues: {},
        context: createMockContext(),
        max: 10,
      });

      const result = validator.safeParse(5);
      expect(result.success).toBe(true);
    });

    it('should throw error when max is not specified', () => {
      expect(() => {
        validations.maxValue({
          formValues: {},
          context: createMockContext(),
        });
      }).toThrow('Max value must be specified');
    });
  });

  describe('minSelected', () => {
    it('should reject arrays with fewer than min items', () => {
      const validator = validations.minSelected({
        formValues: {},
        context: createMockContext(),
        min: 3,
      });

      const result = validator.safeParse(['a', 'b']);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Custom message for minSelected
        expect(result.error.issues[0]?.message).toBe(
          'You must choose a minimum of 3 options.',
        );
      }
    });

    it('should accept arrays with exactly min items', () => {
      const validator = validations.minSelected({
        formValues: {},
        context: createMockContext(),
        min: 3,
      });

      const result = validator.safeParse(['a', 'b', 'c']);
      expect(result.success).toBe(true);
    });

    it('should accept arrays with more than min items', () => {
      const validator = validations.minSelected({
        formValues: {},
        context: createMockContext(),
        min: 2,
      });

      const result = validator.safeParse(['a', 'b', 'c', 'd']);
      expect(result.success).toBe(true);
    });

    it('should use singular form for min=1', () => {
      const validator = validations.minSelected({
        formValues: {},
        context: createMockContext(),
        min: 1,
      });

      const result = validator.safeParse([]);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Custom message for minSelected with singular form
        expect(result.error.issues[0]?.message).toBe(
          'You must choose a minimum of 1 option.',
        );
      }
    });

    it('should throw error when min is not specified', () => {
      expect(() => {
        validations.minSelected({
          formValues: {},
          context: createMockContext(),
        });
      }).toThrow('Min items must be specified');
    });
  });

  describe('maxSelected', () => {
    it('should reject arrays with more than max items', () => {
      const validator = validations.maxSelected({
        formValues: {},
        context: createMockContext(),
        max: 2,
      });

      const result = validator.safeParse(['a', 'b', 'c']);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Custom message for maxSelected
        expect(result.error.issues[0]?.message).toBe(
          'You can choose a maximum of 2 options.',
        );
      }
    });

    it('should accept arrays with exactly max items', () => {
      const validator = validations.maxSelected({
        formValues: {},
        context: createMockContext(),
        max: 3,
      });

      const result = validator.safeParse(['a', 'b', 'c']);
      expect(result.success).toBe(true);
    });

    it('should accept arrays with fewer than max items', () => {
      const validator = validations.maxSelected({
        formValues: {},
        context: createMockContext(),
        max: 5,
      });

      const result = validator.safeParse(['a', 'b']);
      expect(result.success).toBe(true);
    });

    it('should use singular form for max=1', () => {
      const validator = validations.maxSelected({
        formValues: {},
        context: createMockContext(),
        max: 1,
      });

      const result = validator.safeParse(['a', 'b']);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Custom message for maxSelected with singular form
        expect(result.error.issues[0]?.message).toBe(
          'You can choose a maximum of 1 option.',
        );
      }
    });

    it('should throw error when max is not specified', () => {
      expect(() => {
        validations.maxSelected({
          formValues: {},
          context: createMockContext(),
        });
      }).toThrow('Max items must be specified');
    });
  });

  describe('unique', () => {
    it('should reject values that already exist in the network', () => {
      const mockNetwork = {
        nodes: [
          {
            _uid: 'node1',
            type: 'person',
            [entityAttributesProperty]: { name: 'John' },
          },
          {
            _uid: 'node2',
            type: 'person',
            [entityAttributesProperty]: { name: 'Jane' },
          },
        ],
        edges: [],
        ego: {
          _uid: 'ego',
          attributes: {},
        },
      } as unknown as NcNetwork;

      const validator = validations.unique({
        formValues: {},
        context: createMockContext({ network: mockNetwork }),
        attribute: 'name',
      });

      const result = validator.safeParse('John');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'This value must be unique.',
        );
      }
    });

    it('should accept values that do not exist in the network', () => {
      const mockNetwork = {
        nodes: [
          {
            _uid: 'node1',
            type: 'person',
            [entityAttributesProperty]: { name: 'John' },
          },
        ],
        edges: [],
        ego: {
          _uid: 'ego',
          attributes: {},
        },
      } as unknown as NcNetwork;

      const validator = validations.unique({
        formValues: {},
        context: createMockContext({ network: mockNetwork }),
        attribute: 'name',
      });

      const result = validator.safeParse('Alice');
      expect(result.success).toBe(true);
    });

    it('should throw error for ego entities', () => {
      const context = createMockContext({
        subject: { entity: 'ego' } as StageSubject,
      });

      expect(() => {
        validations
          .unique({
            formValues: {},
            context,
            attribute: 'name',
          })
          .safeParse('test');
      }).toThrow('Not applicable to ego entities');
    });

    it('should throw error when attribute is not specified', () => {
      expect(() => {
        validations
          .unique({
            formValues: {},
            context: createMockContext(),
          })
          .safeParse('test');
      }).toThrow('Attribute must be specified for unique validation');
    });
  });

  describe('differentFrom', () => {
    it('should reject values that match the comparison field', () => {
      const validator = validations.differentFrom({
        formValues: { testAttribute: 'sameValue' },
        context: createMockContext(),
        attribute: 'testAttribute',
      });

      const result = validator.safeParse('sameValue');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Your answer must be different from 'Test Attribute'",
        );
      }
    });

    it('should accept values that differ from the comparison field', () => {
      const validator = validations.differentFrom({
        formValues: { testAttribute: 'originalValue' },
        context: createMockContext(),
        attribute: 'testAttribute',
      });

      const result = validator.safeParse('differentValue');
      expect(result.success).toBe(true);
    });

    it('should throw error when attribute is not specified', () => {
      expect(() => {
        validations
          .differentFrom({
            formValues: {},
            context: createMockContext(),
          })
          .safeParse('test');
      }).toThrow('Attribute must be specified for differentFrom validation');
    });

    it('should throw error when attribute is not in form values', () => {
      expect(() => {
        validations
          .differentFrom({
            formValues: {},
            context: createMockContext(),
            attribute: 'missingAttribute',
          })
          .safeParse('test');
      }).toThrow('Form values must contain the attribute being compared');
    });

    it('should throw error when comparison variable is not found in codebook', () => {
      expect(() => {
        validations
          .differentFrom({
            formValues: { unknownAttribute: 'value' },
            context: createMockContext(),
            attribute: 'unknownAttribute',
          })
          .safeParse('test');
      }).toThrow('Comparison variable not found in codebook');
    });
  });

  describe('sameAs', () => {
    it('should reject values that differ from the comparison field', () => {
      const validator = validations.sameAs({
        formValues: { testAttribute: 'originalValue' },
        context: createMockContext(),
        attribute: 'testAttribute',
      });

      const result = validator.safeParse('differentValue');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Your answer must be the same as 'Test Attribute'",
        );
      }
    });

    it('should accept values that match the comparison field', () => {
      const validator = validations.sameAs({
        formValues: { testAttribute: 'sameValue' },
        context: createMockContext(),
        attribute: 'testAttribute',
      });

      const result = validator.safeParse('sameValue');
      expect(result.success).toBe(true);
    });

    it('should throw error when attribute is not specified', () => {
      expect(() => {
        validations
          .sameAs({
            formValues: {},
            context: createMockContext(),
          })
          .safeParse('test');
      }).toThrow('Attribute must be specified for sameAs validation');
    });

    it('should throw error when attribute is not in form values', () => {
      expect(() => {
        validations
          .sameAs({
            formValues: {},
            context: createMockContext(),
            attribute: 'missingAttribute',
          })
          .safeParse('test');
      }).toThrow('Form values must contain the attribute being compared');
    });
  });

  describe('greaterThanVariable', () => {
    it('should reject values less than the comparison field', () => {
      const validator = validations.greaterThanVariable({
        formValues: { numberAttribute: 10 },
        context: createMockContext(),
        attribute: 'numberAttribute',
      });

      const result = validator.safeParse(5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Your answer must be greater than 'Number Attribute'",
        );
      }
    });

    it('should accept values greater than the comparison field', () => {
      const validator = validations.greaterThanVariable({
        formValues: { numberAttribute: 10 },
        context: createMockContext(),
        attribute: 'numberAttribute',
      });

      const result = validator.safeParse(15);
      expect(result.success).toBe(true);
    });

    it('should work with datetime fields', () => {
      const validator = validations.greaterThanVariable({
        formValues: { dateAttribute: '2024-01-01T00:00:00Z' },
        context: createMockContext(),
        attribute: 'dateAttribute',
      });

      const result = validator.safeParse('2024-06-01T00:00:00Z');
      expect(result.success).toBe(true);

      const resultPast = validator.safeParse('2023-06-01T00:00:00Z');
      expect(resultPast.success).toBe(false);
    });

    it('should throw error when attribute is not specified', () => {
      expect(() => {
        validations
          .greaterThanVariable({
            formValues: {},
            context: createMockContext(),
          })
          .safeParse(10);
      }).toThrow(
        'Attribute must be specified for greaterThanVariable validation',
      );
    });

    it('should throw error when attribute is not in form values', () => {
      expect(() => {
        validations
          .greaterThanVariable({
            formValues: {},
            context: createMockContext(),
            attribute: 'missingAttribute',
          })
          .safeParse(10);
      }).toThrow('Form values must contain the attribute being compared');
    });
  });

  describe('lessThanVariable', () => {
    it('should reject values greater than the comparison field', () => {
      const validator = validations.lessThanVariable({
        formValues: { numberAttribute: 10 },
        context: createMockContext(),
        attribute: 'numberAttribute',
      });

      const result = validator.safeParse(15);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Your answer must be less than 'Number Attribute'",
        );
      }
    });

    it('should accept values less than the comparison field', () => {
      const validator = validations.lessThanVariable({
        formValues: { numberAttribute: 10 },
        context: createMockContext(),
        attribute: 'numberAttribute',
      });

      const result = validator.safeParse(5);
      expect(result.success).toBe(true);
    });

    it('should work with datetime fields', () => {
      const validator = validations.lessThanVariable({
        formValues: { dateAttribute: '2024-01-01T00:00:00Z' },
        context: createMockContext(),
        attribute: 'dateAttribute',
      });

      const result = validator.safeParse('2023-06-01T00:00:00Z');
      expect(result.success).toBe(true);

      const resultFuture = validator.safeParse('2024-06-01T00:00:00Z');
      expect(resultFuture.success).toBe(false);
    });

    it('should throw error when attribute is not specified', () => {
      expect(() => {
        validations
          .lessThanVariable({
            formValues: {},
            context: createMockContext(),
          })
          .safeParse(10);
      }).toThrow('Attribute must be specified for lessThanVariable validation');
    });

    it('should throw error when attribute is not in form values', () => {
      expect(() => {
        validations
          .lessThanVariable({
            formValues: {},
            context: createMockContext(),
            attribute: 'missingAttribute',
          })
          .safeParse(10);
      }).toThrow('Form values must contain the attribute being compared');
    });
  });
});
