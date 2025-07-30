import { DocumentValidator } from './document.validator';

describe('DocumentValidator', () => {
  let validator: DocumentValidator;

  beforeEach(() => {
    validator = new DocumentValidator();
  });

  describe('validate', () => {
    // Testes para valores inválidos
    it('should return false for null', () => {
      expect(validator.validate(null as any)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(validator.validate(undefined as any)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validator.validate('')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(validator.validate(123 as any)).toBe(false);
      expect(validator.validate({} as any)).toBe(false);
      expect(validator.validate([] as any)).toBe(false);
    });

    it('should return false for documents with invalid length', () => {
      expect(validator.validate('123456789')).toBe(false); // 9 dígitos
      expect(validator.validate('123456789012')).toBe(false); // 12 dígitos
      expect(validator.validate('123456789012345')).toBe(false); // 15 dígitos
    });

    // Testes para CPF
    describe('CPF validation', () => {
      it('should return true for valid CPF without formatting', () => {
        expect(validator.validate('12345678909')).toBe(true);
        expect(validator.validate('11144477735')).toBe(true);
      });

      it('should return true for valid CPF with formatting', () => {
        expect(validator.validate('123.456.789-09')).toBe(true);
        expect(validator.validate('111.444.777-35')).toBe(true);
      });

      it('should return false for CPF with all same digits', () => {
        expect(validator.validate('11111111111')).toBe(false);
        expect(validator.validate('22222222222')).toBe(false);
        expect(validator.validate('33333333333')).toBe(false);
        expect(validator.validate('44444444444')).toBe(false);
        expect(validator.validate('55555555555')).toBe(false);
        expect(validator.validate('66666666666')).toBe(false);
        expect(validator.validate('77777777777')).toBe(false);
        expect(validator.validate('88888888888')).toBe(false);
        expect(validator.validate('99999999999')).toBe(false);
        expect(validator.validate('00000000000')).toBe(false);
      });

      it('should return false for CPF with invalid verification digits', () => {
        expect(validator.validate('12345678901')).toBe(false); // Dígitos verificadores incorretos
        expect(validator.validate('11144477736')).toBe(false); // Último dígito incorreto
        expect(validator.validate('11144477745')).toBe(false); // Penúltimo dígito incorreto
      });

      it('should return false for CPF with letters', () => {
        expect(validator.validate('123.456.789-0a')).toBe(false);
        expect(validator.validate('abc.def.ghi-jk')).toBe(false);
      });
    });

    // Testes para CNPJ
    describe('CNPJ validation', () => {
      it('should return true for valid CNPJ without formatting', () => {
        expect(validator.validate('11222333000181')).toBe(true);
        expect(validator.validate('11444777000161')).toBe(true);
      });

      it('should return true for valid CNPJ with formatting', () => {
        expect(validator.validate('11.222.333/0001-81')).toBe(true);
        expect(validator.validate('11.444.777/0001-61')).toBe(true);
      });

      it('should return false for CNPJ with all same digits', () => {
        expect(validator.validate('11111111111111')).toBe(false);
        expect(validator.validate('22222222222222')).toBe(false);
        expect(validator.validate('33333333333333')).toBe(false);
        expect(validator.validate('44444444444444')).toBe(false);
        expect(validator.validate('55555555555555')).toBe(false);
        expect(validator.validate('66666666666666')).toBe(false);
        expect(validator.validate('77777777777777')).toBe(false);
        expect(validator.validate('88888888888888')).toBe(false);
        expect(validator.validate('99999999999999')).toBe(false);
        expect(validator.validate('00000000000000')).toBe(false);
      });

      it('should return false for CNPJ with invalid verification digits', () => {
        expect(validator.validate('11222333000180')).toBe(false); // Último dígito incorreto
        expect(validator.validate('11222333000191')).toBe(false); // Penúltimo dígito incorreto
        expect(validator.validate('11222333000100')).toBe(false); // Ambos dígitos incorretos
      });

      it('should return false for CNPJ with letters', () => {
        expect(validator.validate('11.222.333/0001-8a')).toBe(false);
        expect(validator.validate('aa.bbb.ccc/dddd-ee')).toBe(false);
      });
    });

    // Testes para caracteres especiais
    it('should handle documents with special characters', () => {
      expect(validator.validate('123.456.789-09')).toBe(true);
      expect(validator.validate('123-456-789-09')).toBe(true);
      expect(validator.validate('123 456 789 09')).toBe(true);
      expect(validator.validate('123/456/789/09')).toBe(true);
    });
  });

  describe('defaultMessage', () => {
    it('should return correct default message', () => {
      expect(validator.defaultMessage()).toBe('Document must be a valid CPF (11 digits) or CNPJ (14 digits)');
    });
  });

  describe('isValidCPF', () => {
    it('should validate CPF correctly', () => {
      // Usar reflection para testar método privado
      const isValidCPF = (validator as any).isValidCPF.bind(validator);
      
      expect(isValidCPF('12345678909')).toBe(true);
      expect(isValidCPF('11144477735')).toBe(true);
      expect(isValidCPF('12345678901')).toBe(false);
      expect(isValidCPF('11111111111')).toBe(false);
    });
  });

  describe('isValidCNPJ', () => {
    it('should validate CNPJ correctly', () => {
      // Usar reflection para testar método privado
      const isValidCNPJ = (validator as any).isValidCNPJ.bind(validator);
      
      expect(isValidCNPJ('11222333000181')).toBe(true);
      expect(isValidCNPJ('11444777000161')).toBe(true);
      expect(isValidCNPJ('11222333000180')).toBe(false);
      expect(isValidCNPJ('11111111111111')).toBe(false);
    });
  });

  // Testes para casos extremos
  describe('edge cases', () => {
    it('should handle very long strings', () => {
      expect(validator.validate('123456789012345678901234567890')).toBe(false);
    });

    it('should handle strings with only special characters', () => {
      expect(validator.validate('.-/-.-/-.-/')).toBe(false);
      expect(validator.validate('...........')).toBe(false);
    });

    it('should handle mixed valid/invalid formats', () => {
      expect(validator.validate('123.456.789-09123')).toBe(false); // CPF + extra digits
      expect(validator.validate('11.222.333/0001-81234')).toBe(false); // CNPJ + extra digits
    });
  });
}); 