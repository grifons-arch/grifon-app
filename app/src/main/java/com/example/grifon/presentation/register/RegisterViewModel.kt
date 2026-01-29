package com.example.grifon.presentation.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import android.util.Log
import com.example.grifon.domain.auth.RegisterOutcome
import com.example.grifon.domain.auth.RegisterParams
import com.example.grifon.domain.auth.RegisterUseCase
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class RegisterViewModel(
    private val registerUseCase: RegisterUseCase,
) : ViewModel() {
    private val _uiState = MutableStateFlow(RegisterUiState())
    val uiState: StateFlow<RegisterUiState> = _uiState

    fun onSocialTitleChange(value: String) {
        _uiState.update { it.copy(socialTitle = value) }
    }

    fun onFirstNameChange(value: String) {
        _uiState.update { it.copy(firstName = value) }
    }

    fun onLastNameChange(value: String) {
        _uiState.update { it.copy(lastName = value) }
    }

    fun onPhoneChange(value: String) {
        _uiState.update { it.copy(phone = value) }
    }

    fun onIbanChange(value: String) {
        _uiState.update { it.copy(iban = value) }
    }

    fun onEmailChange(value: String) {
        _uiState.update { it.copy(email = value) }
    }

    fun onEmailConfirmationChange(value: String) {
        _uiState.update { it.copy(emailConfirmation = value) }
    }

    fun onCompanyNameChange(value: String) {
        _uiState.update { it.copy(companyName = value) }
    }

    fun onVatNumberChange(value: String) {
        _uiState.update { it.copy(vatNumber = value) }
    }

    fun onCountryChange(value: String) {
        _uiState.update { it.copy(country = value) }
    }

    fun onCityChange(value: String) {
        _uiState.update { it.copy(city = value) }
    }

    fun onStreetChange(value: String) {
        _uiState.update { it.copy(street = value) }
    }

    fun onPostalCodeChange(value: String) {
        _uiState.update { it.copy(postalCode = value) }
    }

    fun onPasswdChange(value: String) {
        _uiState.update { it.copy(passwd = value) }
    }

    fun onPasswdConfirmationChange(value: String) {
        _uiState.update { it.copy(passwdConfirmation = value) }
    }

    fun onCustomerDataPrivacyAcceptedChange(value: Boolean) {
        _uiState.update { it.copy(customerDataPrivacyAccepted = value) }
    }

    fun onNewsletterOptInChange(value: Boolean) {
        _uiState.update { it.copy(newsletterOptIn = value) }
    }

    fun onTermsAndPrivacyAcceptedChange(value: Boolean) {
        _uiState.update { it.copy(termsAndPrivacyAccepted = value) }
    }

    fun onSubmit() {
        val currentState = _uiState.value
        Log.d("RegisterViewModel", "Submit clicked. ${validationDebug(currentState)}")
        if (!currentState.isSubmitEnabled) {
            val validationMessage = validationErrorMessage(currentState)
            Log.w(
                "RegisterViewModel",
                "Submission blocked. ${validationDebug(currentState)} " +
                    "message=$validationMessage",
            )
            _uiState.update {
                it.copy(status = RegisterStatus.Error(validationMessage))
            }
            return
        }

        _uiState.update { it.copy(status = RegisterStatus.Loading) }
        viewModelScope.launch {
            val result = registerUseCase(
                RegisterParams(
                    email = currentState.email.trim(),
                    passwd = currentState.passwd,
                    socialTitle = currentState.socialTitle.trim().ifBlank { null },
                    firstName = currentState.firstName.trim(),
                    lastName = currentState.lastName.trim(),
                    countryIso = currentState.country.trim().uppercase(),
                    street = currentState.street.trim(),
                    city = currentState.city.trim(),
                    postalCode = currentState.postalCode.trim(),
                    phone = currentState.phone.trim().ifBlank { null },
                    company = currentState.companyName.trim().ifBlank { null },
                    vatNumber = currentState.vatNumber.trim().ifBlank { null },
                    iban = currentState.iban.trim().ifBlank { null },
                    customerDataPrivacyAccepted = currentState.customerDataPrivacyAccepted,
                    newsletter = currentState.newsletterOptIn,
                    termsAndPrivacyAccepted = currentState.termsAndPrivacyAccepted,
                ),
            )
            Log.d("RegisterViewModel", "Submit result: ${result::class.simpleName}")
            _uiState.update {
                when (result) {
                    is RegisterOutcome.Success -> it.copy(
                        status = RegisterStatus.Success(result.result.message),
                    )
                    is RegisterOutcome.Error -> it.copy(
                        status = RegisterStatus.Error(result.message),
                    )
                }
            }
        }
    }

    fun onGoogleAccountReceived(account: GoogleSignInAccount) {
        val displayName = account.displayName ?: ""
        val (firstName, lastName) = parseNameParts(
            account.givenName,
            account.familyName,
            displayName,
        )
        val email = account.email.orEmpty()
        _uiState.update {
            it.copy(
                googleDisplayName = displayName.ifBlank { null },
                googleAccountEmail = email.ifBlank { null },
                googleSignInError = null,
                firstName = firstName.ifBlank { it.firstName },
                lastName = lastName.ifBlank { it.lastName },
                email = if (email.isNotBlank()) email else it.email,
                emailConfirmation = if (email.isNotBlank()) email else it.emailConfirmation,
            )
        }
    }

    fun onGoogleAccountError(message: String) {
        _uiState.update { it.copy(googleSignInError = message) }
    }

    private fun parseNameParts(
        givenName: String?,
        familyName: String?,
        displayName: String,
    ): Pair<String, String> {
        if (!givenName.isNullOrBlank() || !familyName.isNullOrBlank()) {
            return givenName.orEmpty() to familyName.orEmpty()
        }
        val parts = displayName.trim().split(" ").filter { it.isNotBlank() }
        return when {
            parts.isEmpty() -> "" to ""
            parts.size == 1 -> parts.first() to ""
            else -> parts.first() to parts.drop(1).joinToString(" ")
        }
    }

    private fun validationDebug(state: RegisterUiState): String {
        val missing = buildList {
            if (state.firstName.isBlank()) add("firstName")
            if (state.lastName.isBlank()) add("lastName")
            if (state.country.trim().length != 2) add("countryIso")
            if (state.city.isBlank()) add("city")
            if (state.street.isBlank()) add("street")
            if (state.postalCode.isBlank()) add("postalCode")
            if (state.email.isBlank()) add("email")
            if (state.email != state.emailConfirmation) add("emailConfirmation")
            if (state.passwd.trim().length < 8) add("passwdLength")
            if (state.passwd != state.passwdConfirmation) add("passwdConfirmation")
            if (!state.customerDataPrivacyAccepted) add("customerDataPrivacyAccepted")
            if (!state.termsAndPrivacyAccepted) add("termsAndPrivacyAccepted")
        }
        return "isSubmitEnabled=${state.isSubmitEnabled} " +
            "missing=${missing.joinToString()} status=${state.status::class.simpleName}"
    }

    private fun validationErrorMessage(state: RegisterUiState): String {
        val missing = buildList {
            if (state.firstName.isBlank()) add("Όνομα")
            if (state.lastName.isBlank()) add("Επώνυμο")
            if (state.country.trim().length != 2) add("Χώρα (ISO)")
            if (state.city.isBlank()) add("Πόλη")
            if (state.street.isBlank()) add("Οδός και Αριθμός")
            if (state.postalCode.isBlank()) add("Τ.Κ")
            if (state.email.isBlank()) add("Email")
            if (state.email != state.emailConfirmation) add("Επιβεβαίωση Email")
            if (state.passwd.trim().length < 8) add("Κωδικός (τουλάχιστον 8 χαρακτήρες)")
            if (state.passwd != state.passwdConfirmation) add("Επιβεβαίωση Κωδικού")
            if (!state.customerDataPrivacyAccepted) add("Προστασία δεδομένων πελάτη")
            if (!state.termsAndPrivacyAccepted) add("Όρους και πολιτική απορρήτου")
        }
        return if (missing.isEmpty()) {
            "Δεν είναι δυνατή η αποθήκευση. Ελέγξτε τα στοιχεία σας."
        } else {
            "Συμπληρώστε τα υποχρεωτικά πεδία: ${missing.joinToString()}."
        }
    }
}
