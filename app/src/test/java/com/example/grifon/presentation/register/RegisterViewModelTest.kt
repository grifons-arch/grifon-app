package com.example.grifon.presentation.register

import com.example.grifon.domain.auth.RegisterOutcome
import com.example.grifon.domain.auth.RegisterParams
import com.example.grifon.domain.auth.RegisterRepository
import com.example.grifon.domain.auth.RegisterResult
import com.example.grifon.domain.auth.RegisterUseCase
import com.example.grifon.testing.MainDispatcherRule
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class RegisterViewModelTest {
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun `onSubmit updates state to success`() = runTest {
        val deferred = CompletableDeferred<RegisterOutcome>()
        val viewModel = RegisterViewModel(
            RegisterUseCase(DeferredRegisterRepository(deferred)),
        )

        viewModel.onFirstNameChange("Test")
        viewModel.onLastNameChange("User")
        viewModel.onPhoneChange("2100000000")
        viewModel.onCountryChange("Ελλάδα")
        viewModel.onCityChange("Αθήνα")
        viewModel.onStreetChange("Οδός 1")
        viewModel.onPostalCodeChange("10435")
        viewModel.onEmailChange("test@example.com")
        viewModel.onEmailConfirmationChange("test@example.com")
        viewModel.onPasswdChange("secret123")
        viewModel.onPasswdConfirmationChange("secret123")
        viewModel.onCustomerDataPrivacyAcceptedChange(true)
        viewModel.onTermsAndPrivacyAcceptedChange(true)

        viewModel.onSubmit()

        assertTrue(viewModel.uiState.value.status is RegisterStatus.Loading)

        deferred.complete(
            RegisterOutcome.Success(
                RegisterResult(
                    customerId = "123",
                    status = "PENDING",
                    message = "ok",
                ),
            ),
        )
        advanceUntilIdle()

        assertTrue(viewModel.uiState.value.status is RegisterStatus.Success)
    }

    @Test
    fun `onSubmit updates state to error`() = runTest {
        val deferred = CompletableDeferred<RegisterOutcome>()
        val viewModel = RegisterViewModel(
            RegisterUseCase(DeferredRegisterRepository(deferred)),
        )

        viewModel.onFirstNameChange("Test")
        viewModel.onLastNameChange("User")
        viewModel.onPhoneChange("2100000000")
        viewModel.onCountryChange("Ελλάδα")
        viewModel.onCityChange("Αθήνα")
        viewModel.onStreetChange("Οδός 1")
        viewModel.onPostalCodeChange("10435")
        viewModel.onEmailChange("test@example.com")
        viewModel.onEmailConfirmationChange("test@example.com")
        viewModel.onPasswdChange("secret123")
        viewModel.onPasswdConfirmationChange("secret123")
        viewModel.onCustomerDataPrivacyAcceptedChange(true)
        viewModel.onTermsAndPrivacyAcceptedChange(true)

        viewModel.onSubmit()

        assertTrue(viewModel.uiState.value.status is RegisterStatus.Loading)

        deferred.complete(RegisterOutcome.Error("failed"))
        advanceUntilIdle()

        assertTrue(viewModel.uiState.value.status is RegisterStatus.Error)
    }
}

private class DeferredRegisterRepository(
    private val deferred: CompletableDeferred<RegisterOutcome>,
) : RegisterRepository {
    override suspend fun register(params: RegisterParams): RegisterOutcome = deferred.await()
}
