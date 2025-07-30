import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isValidDocument', async: false })
export class DocumentValidator implements ValidatorConstraintInterface {
  validate(document: string): boolean {
    if (!document || typeof document !== 'string') {
      return false;
    }

    // Remove caracteres não numéricos
    const cleanDocument = document.replace(/[^\d]/g, '');

    // Verifica se é CPF (11 dígitos)
    if (cleanDocument.length === 11) {
      return this.isValidCPF(cleanDocument);
    }

    // Verifica se é CNPJ (14 dígitos)
    if (cleanDocument.length === 14) {
      return this.isValidCNPJ(cleanDocument);
    }

    return false;
  }

  defaultMessage(): string {
    return 'Document must be a valid CPF (11 digits) or CNPJ (14 digits)';
  }

  private isValidCPF(cpf: string): boolean {
    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cpf[9]) !== digit1) {
      return false;
    }

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cpf[10]) === digit2;
  }

  private isValidCNPJ(cnpj: string): boolean {
    // Verifica se todos os dígitos são iguais (ex: 11.111.111/0001-11)
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    // Validação do primeiro dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj[i]) * weights1[i];
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cnpj[12]) !== digit1) {
      return false;
    }

    // Validação do segundo dígito verificador
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj[i]) * weights2[i];
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cnpj[13]) === digit2;
  }
}

export function IsValidDocument(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DocumentValidator,
    });
  };
} 