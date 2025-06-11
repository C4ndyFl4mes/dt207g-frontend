import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { Response } from '../../models/response';
import { FormMessageComponent } from "../../partials/form-message/form-message.component";
import { Validation } from '../../validation';

@Component({
  selector: 'app-account',
  imports: [FormsModule, FormMessageComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {

  onRegistration = signal<boolean>(true); // Vilken "flik" det ska vara, att logga in eller registrera sig.

  // Fälten:
  user = {
    firstname: "",
    lastname: "",
    email: "",
    password: ""
  }

  errors = signal<Array<string>>([]); // Lagrar felmeddelanden för inmatningsfälten.

  // Startvärde för success meddelandet.
  success = signal<Response<string>>({
    success: false,
    data: "",
    message: ""
  });


  constructor(private accountSerivce: AccountService) { }

  /**
   * Validerar inmatningsfälten innan registrering anropas.
   */
  registrate(): void {
    const user = this.user; // Slipper skriva this hela tiden.

    this.success().success = false;
    this.errors.set([]); // Återställer felmeddelanden för att endast relevanta felmeddelanden ska visas.

    // Valideringar för förnamn, mellan 2 och 32 tecken, får inte innehålla siffror eller specialtecken.
    const firstnameRange = Validation.range<string>(user.firstname, "Förnamn", 2, 32);
    if (firstnameRange) this.errors().push(firstnameRange);
    const firstnameHasNumbers = Validation.unableToContainNumbers(user.firstname, "Förnamn");
    if (firstnameHasNumbers) this.errors().push(firstnameHasNumbers);
    const firstnameHasSpecial = Validation.unableToContainSpecialChar(user.firstname, "Förnamn");
    if (firstnameHasSpecial) this.errors().push(firstnameHasSpecial);

    // Samma valideringar som för förnamn.
    const lastnameRange = Validation.range<string>(user.lastname, "Efternamn", 2, 32);
    if (lastnameRange) this.errors().push(lastnameRange);
    const lastnameHasNumbers = Validation.unableToContainNumbers(user.lastname, "Efternamn");
    if (lastnameHasNumbers) this.errors().push(lastnameHasNumbers);
    const lastnameHasSpecial = Validation.unableToContainSpecialChar(user.lastname, "Efternamn");
    if (lastnameHasSpecial) this.errors().push(lastnameHasSpecial);

    // Validerar att e-posten är korrekt formatterad, typ a@b.c
    const email = Validation.email(user.email, "E-post");
    if (email) this.errors().push(email);

    // Validerar att lösenordet är 8 tecken långt, har minst en av följande, gemen, versal, siffra och specialtecken.
    const passwordLength = Validation.passwordLength(user.password);
    if (passwordLength) this.errors().push(passwordLength);
    const passwordSmallChar = Validation.passwordSmallChar(user.password);
    if (passwordSmallChar) this.errors().push(passwordSmallChar);
    const passwordCapitalChar = Validation.passwordCapitalChar(user.password);
    if (passwordCapitalChar) this.errors().push(passwordCapitalChar);
    const passwordNumber = Validation.passwordNumber(user.password);
    if (passwordNumber) this.errors().push(passwordNumber);
    const passwordSpecialChar = Validation.passwordSpecialChar(user.password);
    if (passwordSpecialChar) this.errors().push(passwordSpecialChar);

    if (this.errors().length === 0) {
      this.accountSerivce.register(this.user.firstname, this.user.lastname, this.user.email, this.user.password).subscribe({
        next: () => {
          this.login(); // Loggar in automatiskt efter lyckad registrering.
        },
        error: (error) => {
          this.errors().push(error.error.message);
        }
      });
    }
  }

  /**
   * Loggar in användaren och visar ett meddelande på skärmen att användaren är "...inloggad som namn"
   */
  login(): void {
    this.success().success = false;
    this.errors.set([]);
    this.accountSerivce.login(this.user.email, this.user.password).subscribe({
      next: (response) => {
        this.accountSerivce.setUser(response.data.account, response.data.token);
        this.user = {
          firstname: "",
          lastname: "",
          email: "",
          password: ""
        };

        this.success.set({
          success: response.success,
          data: `${response.data.account.firstname} ${response.data.account.lastname}`,
          message: "Du är nu inloggad som "
        });
      },
      error: (error) => {
        this.errors().push(error.error.message);
      }
    });
  }
}