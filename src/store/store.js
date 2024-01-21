/* eslint-disable */

import { createStore } from "vuex"

const store = createStore({
    state: { 

      scheduleJson: {},
      tmpLesson: {},

      templates: [],

      isSavedState: true,

      selectedLesson: null,
      lessonCategories: [],

      sidebarState: null,

      isPDFLoading: false,

      minRowHeight: 1.45,

    },
    mutations: {
      //are methods which change the data in the state
      //so async functionality

      set_tmp_lesson(state, lesson) {
        state.tmpLesson = lesson;
      },

      set_sidebar_state(state, sidebarState) {
        this.commit('set_tmp_lesson', {})
        state.sidebarState = sidebarState;
      },


      set_tmp_lesson_by_id(state, { weekIndex, lessonId}) {
        let foundId = false;

        for(var day of state.scheduleJson.schedule[`week${weekIndex+1}`]) {
          if(foundId == true) {
            break;
          }

          for(var elLesson of day.lessons) {
            if(elLesson._id == lessonId) {
              foundId = true;
              this.commit('set_tmp_lesson', elLesson);
              break;
            }
          }

        }


      },

      set_is_saved_state(state, isSavedState) {
        state.isSavedState = isSavedState;
      },

      set_pdf_processing(state, isPDFLoading) {
        state.isPDFLoading = isPDFLoading;
      },

      UPDATE_SCHEDULE(state, schedule) {
        state.scheduleJson = schedule;
      },

      REPLACE_SCHEDULE_BY_TEMPLATE(state, template) {
        const originalId = state.scheduleJson._id;

        state.scheduleJson = {...template};
        state.scheduleJson._id = originalId;
      },

      UPDATE_TEMPLATES(state, templates) {
        state.templates = templates;
      },

      UPDATE_SCHEDULE_BASE_INFORMATION(state, name, information) {
        state.scheduleJson.name = name;
        state.scheduleJson.information = information;
      },

      UPDATE_LESSON_CATEGORIES(state, lessonCategories) {
        state.lessonCategories = lessonCategories;
      }

    },
    actions: {
      //methods than can access data in the state but cannot change them
      //has async functionality

      async add_link_to_lesson({ state }, { lesson, linkInformation, linkUrl }) {
        lesson.subjectLinkInformation.push({ information: linkInformation, url: linkUrl})
 
        await this.dispatch('update_lesson', lesson);
      },

      async update_lesson_category({ state }, { lesson, lessonCategoryId }) {
        lesson.subjectCategory = state.lessonCategories.find(category => category.id === lessonCategoryId)
        await this.dispatch('update_lesson', lesson);
      },

      async update_lesson({ state, commit }, lesson) {
        commit('set_is_saved_state', false);
        try {
          const response = await fetch('http://localhost:3000/update-lesson', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({lesson: lesson}),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Fehler beim Server: ${response.status} - ${response.statusText}`);
            }
            return response.json();
          })
          .then(response => {
            //server also sends the whole updated schedule, so we dont have to call the server twice for receicing 
            //commit('UPDATE_SCHEDULE', response.schedule)
            commit('set_is_saved_state', true);
          })

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }


      },

      async create_new_entry_at_day_index({ state, commit }, {weekIndex, dayIndex}) {
        commit('set_is_saved_state', false);

        
        try {
          const response = await fetch('http://localhost:3000/add-new-lesson', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({weekIndex: weekIndex, dayIndex: dayIndex}),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Fehler beim Server: ${response.status} - ${response.statusText}`);
            }
            return response.json();
          })
          .then(response => {
            //server also sends the whole updated schedule, so we dont have to call the server twice for receicing 
            //the updated schedule 
            commit('UPDATE_SCHEDULE', response.schedule);
            const lessonId = response.lessonId;
            commit('set_tmp_lesson_by_id', { weekIndex, lessonId});
            commit('set_is_saved_state', true);
          })

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }
      },

      async update_specific_week_schedule({ state, commit }, {weekIndex, weekSchedule}) {
        commit('set_is_saved_state', false);
        
        try {
          const response = await fetch('http://localhost:3000/update-uni-day', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({weekIndex: weekIndex, weekSchedule: weekSchedule}),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Fehler beim Server: ${response.status} - ${response.statusText}`);
            }
            return response.json();
          })
          .then(response => {
            //server also sends the whole updated schedule, so we dont have to call the server twice for receicing 
            //the updated schedule 
            commit('UPDATE_SCHEDULE', response.schedule);
            commit('set_is_saved_state', true);
          })

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }
      },

      async update_schedule_name({ state, commit }, name) {
        commit('UPDATE_SCHEDULE_BASE_INFORMATION', name, state.scheduleJson.information);
        await this.dispatch('save_schedule_in_database')
        await this.dispatch('load_schedule')
      },

      async update_schedule_information({ state, commit }, information) {
        commit('UPDATE_SCHEDULE_BASE_INFORMATION', state.scheduleJson.name, information);
        await this.dispatch('save_schedule_in_database')
        await this.dispatch('load_schedule')
      },

      async delete_lesson_by_id({ state, commit }, lessonId) {
        commit('set_is_saved_state', false);

        try {
          const response = await fetch('http://localhost:3000/delete-lesson-by-id', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({lessonId: lessonId}),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Fehler beim Server: ${response.status} - ${response.statusText}`);
            }
            return response.json();
          })
          .then(response => {
            //server also sends the whole updated schedule, so we dont have to call the server twice for receicing 
            //the updated schedule 
            commit('UPDATE_SCHEDULE', response.schedule)
            commit('set_tmp_lesson', {})
            commit('set_is_saved_state', true);
          })

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }

      },


      async use_template({ commit }, { templateId, startDate }) {
        commit('set_is_saved_state', false);
        const data = {
              templateId: templateId, 
              startDate: startDate, 
            };

        try {
          const response = await fetch('http://localhost:3000/use-template', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          //const content = await response.json();
          if (response.status == 200) {
            commit('set_is_saved_state', true);
          } else {
            console.log('error updating')
          }

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }

        await this.dispatch('load_schedule')
      },


      async delete_template({ commit }, template) {
        commit('set_is_saved_state', false);
        try {
          const response = await fetch('http://localhost:3000/delete-template-in-database', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({_id: template._id})
          })
          //const content = await response.json();
          if (response.status == 200) {
            commit('set_is_saved_state', true);
          } else {
            console.log('error updating')
          }

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }

        await this.dispatch('load_templates')
      },

      async load_schedule({ commit }) {
        try {
          const response = await fetch('http://localhost:3000/get-schedule')
          const scheduleData = await response.json();
          commit('UPDATE_SCHEDULE', scheduleData.data);

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }
      },

      async load_templates({ commit }) {
        try {
          const response = await fetch('http://localhost:3000/get-templates')
          const templates = await response.json()
          commit('UPDATE_TEMPLATES', templates.data);

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }
      },

      async create_new_blank_schedule({ commit }, {startDate, name, information}) {
        commit('set_is_saved_state', false);
        const basicScheduleInformation = {
              startDate: startDate, 
              name: name, 
              information: information,
              contactPerson: '',
              contactDetails: '',
              address: '',
            };

        try {
          const response = await fetch('http://localhost:3000/create-new-blank-schedule', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(basicScheduleInformation)
          })
          //const content = await response.json();
          if (response.status == 200) {
            commit('set_is_saved_state', true);
          } else {
            console.log('error updating')
          }

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }

        await this.dispatch('load_schedule')
      },

      async save_schedule_in_database({ commit }) {
        commit('set_is_saved_state', false);
        try {
          const response = await fetch('http://localhost:3000/update-schedule', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(store.state.scheduleJson)
          })
          //const content = await response.json();
          if (response.status == 200) {
            commit('set_is_saved_state', true);
          } else {
            console.log('error updating')
          }

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }
      },

      async add_schedule_as_template({ commit, state }, {trimmedName, trimmedInformation}) {
        commit('set_is_saved_state', false);
        const data = {name: trimmedName, information: trimmedInformation, schedule: store.state.scheduleJson}
        try {
            const response = await fetch('http://localhost:3000/add-schedule-as-template', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
          //const content = await response.json();
          if (response.status != 200) {
            console.log('error updating')
          } else {
            commit('set_is_saved_state', true);
          }

          

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }
        
        await this.dispatch('load_templates')
      },

      async load_lesson_categories({ commit }) {
        try {
          const response = await fetch('http://localhost:3000/get-lesson-categories')
          const lessonCategories = await response.json()
          commit('UPDATE_LESSON_CATEGORIES', lessonCategories.data);

        } catch (error) {
          console.error('Fehler beim Abrufen:', error);
        }
      }


    },
    getters: {
      /*
      get_userById: (state) => (userId) => {
        for(const user of state.users) {
          if(user.id === userId) return user;
        }
        return null;
      }
      */
    }
})

export default store
