import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { Response } from '../../models/response';

@Component({
  selector: 'app-account',
  imports: [FormsModule],
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

  errors = signal<Array<{ id: number; message: string; }>>([]); // Lagrar felmeddelanden för inmatningsfälten.

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

    this.errors.set([]); // Återställer felmeddelanden för att endast relevanta felmeddelanden ska visas.

    if (user.firstname.length < 2 || user.firstname.length > 32) {
      this.errors().push({ id: 8, message: "Förnamn måste vara mellan två och 32 tecken." });
    }

    if (user.lastname.length < 2 || user.lastname.length > 32) {
      this.errors().push({ id: 7, message: "Efternamn måste vara mellan två och 32 tecken." });
    }

    if (!user.email.includes("@") || !user.email.includes(".")) {
      this.errors().push({ id: 6, message: "E-post addressen är felaktig." });
    }

    // Lösenordsvalideringar:
    if (!/[a-z]/.test(user.password)) this.errors().push({ id: 1, message: "Lösenordet måste innehålla en liten bokstav." });
    if (!/[A-Z]/.test(user.password)) this.errors().push({ id: 2, message: "Lösenordet måste innehålla en stor bokstav." });
    if (!/\d/.test(user.password)) this.errors().push({ id: 3, message: "Lösenordet måste innehålla en siffra." });
    if (!/[!@#$%^&*]/.test(user.password)) this.errors().push({ id: 4, message: "Lösenordet måste innehålla ett special tecken (!@#$%^&*)." });
    if (user.password.length < 8) this.errors().push({ id: 5, message: "Lösenordet är för kort. Minst åtta tecken långt." });

    if (this.errors().length === 0) {
      this.accountSerivce.register(this.user.firstname, this.user.lastname, this.user.email, this.user.password).subscribe({
        next: () => {
          this.login(); // Loggar in automatiskt efter lyckan registrering.
        },
        error: (error) => {
          this.errors().push({ id: 9, message: error.error.message });
        }
      });
    }
  }

  /**
   * Loggar in användaren och visar ett meddelande på skärmen att användaren är "...inloggad som namn"
   */
  login(): void {
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
        console.log(error);
      }
    })
  }

}
