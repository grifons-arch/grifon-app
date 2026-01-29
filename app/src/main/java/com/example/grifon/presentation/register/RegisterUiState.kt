package com.example.grifon.presentation.register

data class RegisterUiState(
    val socialTitle: String = "",
    val firstName: String = "",
    val lastName: String = "",
    val phone: String = "",
    val iban: String = "",
    val email: String = "",
    val emailConfirmation: String = "",
    val password: String = "",
    val passwordConfirmation: String = "",
    val companyName: String = "",
    val vatNumber: String = "",
    val country: String = "",
    val city: String = "",
    val street: String = "",
    val postalCode: String = "",
    val passwd: String = "",
    val passwdConfirmation: String = "",
    val customerDataPrivacyAccepted: Boolean = false,
    val newsletterOptIn: Boolean = false,
    val termsAndPrivacyAccepted: Boolean = false,
    val googleDisplayName: String? = null,
    val googleAccountEmail: String? = null,
    val googleSignInError: String? = null,
    val status: RegisterStatus = RegisterStatus.Idle,
) {
    val isSubmitEnabled: Boolean
        get() = status !is RegisterStatus.Loading &&
            firstName.isNotBlank() &&
            lastName.isNotBlank() &&
            country.trim().length == 2 &&
            city.isNotBlank() &&
            street.isNotBlank() &&
            postalCode.isNotBlank() &&
            email.isNotBlank() &&
            email == emailConfirmation &&

            password.trim().length >= 8 &&
            password == passwordConfirmation &&

            passwd.trim().length >= 8 &&
            passwd == passwdConfirmation &&

            customerDataPrivacyAccepted &&
            termsAndPrivacyAccepted
}

sealed interface RegisterStatus {
    data object Idle : RegisterStatus
    data object Loading : RegisterStatus
    data class Success(val message: String) : RegisterStatus
    data class Error(val message: String) : RegisterStatus
}
