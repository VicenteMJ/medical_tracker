'use client'

import { useState, useEffect } from 'react'
import { Appointment, Prescription, Medication, Bill } from '@/types/database'
import { updateAppointment } from '@/lib/appointments'
import { createPrescription } from '@/lib/prescriptions'
import { createBill } from '@/lib/bills'
import { getMedications } from '@/lib/medications'
import { createPendingAction } from '@/lib/pending-actions'
import { PrescriptionForm } from '@/components/prescriptions/prescription-form'
import { BillForm } from '@/components/bills/bill-form'
import { SimpleMedicationInput } from '@/components/medications/simple-medication-input'

interface AppointmentFollowupWizardProps {
  appointment: Appointment
  onComplete: () => void
  onClose: () => void
}

type WizardStep = 
  | 'attendance'
  | 'visit-bill'
  | 'visit-bill-form'
  | 'prescription-check'
  | 'prescription-form'
  | 'medication-check'
  | 'medications-annotations'
  | 'medication-input'
  | 'pharmacy-purchase'
  | 'pharmacy-bill-form'
  | 'complete'

export function AppointmentFollowupWizard({ appointment, onComplete, onClose }: AppointmentFollowupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('attendance')
  const [attendanceAnswer, setAttendanceAnswer] = useState<boolean | null>(null)
  const [visitBillAnswer, setVisitBillAnswer] = useState<boolean | null>(null)
  const [prescriptionAnswer, setPrescriptionAnswer] = useState<boolean | null>(null)
  const [medicationCheckAnswer, setMedicationCheckAnswer] = useState<boolean | null>(null)
  const [medicationsAnnotationAnswer, setMedicationsAnnotationAnswer] = useState<boolean | null>(null)
  const [pharmacyPurchaseAnswer, setPharmacyPurchaseAnswer] = useState<boolean | null>(null)
  
  const [createdPrescription, setCreatedPrescription] = useState<Prescription | null>(null)
  const [createdMedications, setCreatedMedications] = useState<Medication[]>([])
  const [allMedications, setAllMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMedications() {
      try {
        const meds = await getMedications()
        setAllMedications(meds)
      } catch (err) {
        console.error('Failed to load medications:', err)
      }
    }
    loadMedications()
  }, [])

  const handleAttendance = async (attended: boolean) => {
    setIsLoading(true)
    setError(null)
    try {
      await updateAppointment(appointment.id, { status: attended ? 'attended' : 'missed' })
      setAttendanceAnswer(attended)
      
      if (!attended) {
        // Mark as missed and end
        onComplete()
        return
      }
      
      setCurrentStep('visit-bill')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVisitBill = (paid: boolean) => {
    setVisitBillAnswer(paid)
    if (paid) {
      // Will show form, user can skip
      setCurrentStep('visit-bill-form')
    } else {
      setCurrentStep('prescription-check')
    }
  }

  const handleVisitBillFormSubmit = async (billData: Omit<Bill, 'id' | 'created_at'>) => {
    setIsLoading(true)
    setError(null)
    try {
      await createBill({
        ...billData,
        appointment_id: appointment.id,
      })
      setCurrentStep('prescription-check')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bill')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVisitBillSkip = () => {
    setCurrentStep('prescription-check')
  }

  const handlePrescriptionCheck = (hasPrescription: boolean) => {
    setPrescriptionAnswer(hasPrescription)
    if (hasPrescription) {
      setCurrentStep('prescription-form')
    } else {
      // No prescription, finish wizard
      onComplete()
    }
  }

  const handlePrescriptionFormSubmit = async (prescriptionData: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true)
    setError(null)
    try {
      const prescription = await createPrescription({
        ...prescriptionData,
        appointment_id: appointment.id,
      })
      setCreatedPrescription(prescription)
      setCurrentStep('medication-check')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prescription')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMedicationCheck = (hasMedsAtHome: boolean) => {
    setMedicationCheckAnswer(hasMedsAtHome)
    if (hasMedsAtHome) {
      setCurrentStep('medications-annotations')
    } else {
      setCurrentStep('medication-input')
    }
  }

  const handleMedicationsAnnotation = (medsInTab: boolean) => {
    setMedicationsAnnotationAnswer(medsInTab)
    if (medsInTab) {
      setCurrentStep('pharmacy-purchase')
    } else {
      setCurrentStep('medication-input')
    }
  }

  const handleMedicationsAdded = (medications: Medication[]) => {
    setCreatedMedications([...createdMedications, ...medications])
    setAllMedications([...allMedications, ...medications])
    setCurrentStep('pharmacy-purchase')
  }

  const handlePharmacyPurchase = async (bought: boolean) => {
    setPharmacyPurchaseAnswer(bought)
    if (bought) {
      setCurrentStep('pharmacy-bill-form')
    } else {
      // Create pending actions for each medication
      setIsLoading(true)
      setError(null)
      try {
        const medicationsToRemind = createdMedications.length > 0 
          ? createdMedications 
          : allMedications.filter(m => 
              m.notes?.includes('prescription') || 
              m.start_date === new Date().toISOString().split('T')[0]
            )
        
        for (const med of medicationsToRemind) {
          await createPendingAction({
            appointment_id: appointment.id,
            prescription_id: createdPrescription?.id || null,
            medication_name: med.name,
            action_type: 'medication_purchase',
            description: `Remember to buy ${med.name}`,
          })
        }
        onComplete()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create reminders')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handlePharmacyBillSubmit = async (billData: Omit<Bill, 'id' | 'created_at'>) => {
    setIsLoading(true)
    setError(null)
    try {
      await createBill({
        ...billData,
        appointment_id: appointment.id,
        prescription_id: createdPrescription?.id || null,
        notes: billData.notes 
          ? `${billData.notes} (Pharmacy purchase)`
          : 'Pharmacy purchase',
      })
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bill')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepNumber = (step: WizardStep): number => {
    const stepOrder: WizardStep[] = [
      'attendance',
      'visit-bill',
      'visit-bill-form',
      'prescription-check',
      'prescription-form',
      'medication-check',
      'medications-annotations',
      'medication-input',
      'pharmacy-purchase',
      'pharmacy-bill-form',
      'complete',
    ]
    return stepOrder.indexOf(step) + 1
  }

  const getStepTitle = (step: WizardStep): string => {
    switch (step) {
      case 'attendance': return 'Step 1: Attendance'
      case 'visit-bill':
      case 'visit-bill-form': return 'Step 2: Visit Bill'
      case 'prescription-check':
      case 'prescription-form': return 'Step 3: Prescription Check'
      case 'medication-check': return 'Step 4: Medication Check'
      case 'medications-annotations': return 'Step 5-b: Medications Annotations'
      case 'medication-input': return 'Step 5-a: Medication Input'
      case 'pharmacy-purchase':
      case 'pharmacy-bill-form': return 'Step 6: Pharmacy Purchase'
      default: return 'Complete'
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'attendance':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Did you attend your appointment with {appointment.doctor_name}?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleAttendance(true)}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Yes, I attended
              </button>
              <button
                onClick={() => handleAttendance(false)}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                No, I missed it
              </button>
            </div>
          </div>
        )

      case 'visit-bill':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Did you pay for the consultation?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleVisitBill(true)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Yes
              </button>
              <button
                onClick={() => handleVisitBill(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                No
              </button>
            </div>
          </div>
        )

      case 'visit-bill-form':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Visit Bill
            </h3>
            <BillForm
              onSubmit={handleVisitBillFormSubmit}
              onCancel={handleVisitBillSkip}
              defaultAppointmentId={appointment.id}
            />
            <button
              onClick={handleVisitBillSkip}
              className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              Skip this step
            </button>
          </div>
        )

      case 'prescription-check':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Did the doctor give you a prescription?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handlePrescriptionCheck(true)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Yes
              </button>
              <button
                onClick={() => handlePrescriptionCheck(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                No
              </button>
            </div>
          </div>
        )

      case 'prescription-form':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Prescription
            </h3>
            <PrescriptionForm
              onSubmit={handlePrescriptionFormSubmit}
              onCancel={() => setCurrentStep('prescription-check')}
              defaultAppointmentId={appointment.id}
            />
          </div>
        )

      case 'medication-check':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Do you have all the medicine of this prescription at home already?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleMedicationCheck(true)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Yes
              </button>
              <button
                onClick={() => handleMedicationCheck(false)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                No
              </button>
            </div>
          </div>
        )

      case 'medications-annotations':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Are all the medications in the medications tab?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleMedicationsAnnotation(true)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Yes
              </button>
              <button
                onClick={() => handleMedicationsAnnotation(false)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                No
              </button>
            </div>
          </div>
        )

      case 'medication-input':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What medications are on this prescription?
            </h3>
            <SimpleMedicationInput
              onMedicationsAdded={handleMedicationsAdded}
            />
          </div>
        )

      case 'pharmacy-purchase':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Did you buy the medication yet?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handlePharmacyPurchase(true)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Yes
              </button>
              <button
                onClick={() => handlePharmacyPurchase(false)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                No
              </button>
            </div>
          </div>
        )

      case 'pharmacy-bill-form':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Pharmacy Bill
            </h3>
            <BillForm
              onSubmit={handlePharmacyBillSubmit}
              onCancel={() => setCurrentStep('pharmacy-purchase')}
              defaultAppointmentId={appointment.id}
              defaultPrescriptionId={createdPrescription?.id}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Post-Appointment Follow-up
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getStepTitle(currentStep)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4">
            <div className="flex items-center">
              {['attendance', 'visit-bill', 'prescription-check', 'medication-check', 'pharmacy-purchase'].map((step, index) => {
                const stepNum = index + 1
                const isActive = currentStep === step || 
                  (step === 'attendance' && attendanceAnswer !== null) ||
                  (step === 'visit-bill' && visitBillAnswer !== null) ||
                  (step === 'prescription-check' && prescriptionAnswer !== null) ||
                  (step === 'medication-check' && medicationCheckAnswer !== null) ||
                  (step === 'pharmacy-purchase' && pharmacyPurchaseAnswer !== null)
                
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex-1 h-2 rounded ${isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    {index < 4 && <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mx-1" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {renderStep()}
        </div>
      </div>
    </div>
  )
}
